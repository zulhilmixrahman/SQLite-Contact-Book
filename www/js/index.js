//Global variable
var dataSource, btnSubmitState = 'create', updatePk = 0;
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        //Open and Create Table if not exists on load page
        dataSource = window.sqlitePlugin.openDatabase({name: "contact_book.db"});
        dataSource.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT, address TEXT)');
        }, function (e) {
            console.log("ERR CREATE DB: " + JSON.stringify(e));
        });

        //Contact list
        app.funcList();

        //Add Contact
        $('#btnForm').click(function () {
            $('#modalForm').modal('show');
        });
        $('#btnTruncate').click(function () {
            app.funcTruncate();
        });
        $('#btnSubmit').click(function () {
            if (btnSubmitState === 'create')
                app.funcCreate();
            else if (btnSubmitState === 'update')
                app.funcUpdate(updatePk);
        });
    },
    funcList: function () {
        console.log('funcList');
        dataSource.transaction(function (tx) {
            tx.executeSql("SELECT * FROM test_form;", [], function (tx, res) {
                var output = '<table class="ui celled table unstackable">'
                        + '<thead>'
                        + '<tr><th>id</th><th>name</th><th>email</th><th>action</th></tr>'
                        + '</thead>';

                //Get length of row data
                var length = res.rows.length;
                //Read data item per row based on length
                var bil = 1;
                for (var i = 0; i < length; i++) {
                    var item = res.rows.item(i);
                    output += '<tr id="tr_' + item.id + '">'
                            + '<td>' + (bil++) + '</td>'
                            + '<td>' + item.name + '</td>'
                            + '<td>' + item.email + '</td>'
                            + '<td>'
                            + '<a id="btnEdit" href="#" onClick="contactEdit(' + item.id + ')"><i class="teal large inverted bordered edit icon"></i></a>'
                            + '<a id="btnDelete" href="#" onClick="contactDelete(' + item.id + ')"><i class="red large inverted bordered trash outline icon"></i></a>'
                            + '</td>'
                            + '</tr>';
                }

                output += '</table>';
                $('#formOutput').html(output);
            });
        }, function (e) {
            console.log("ERROR: " + JSON.stringify(e));
        });
    },
    funcCreate: function () {
        dataSource.transaction(function (tx) {
            tx.executeSql("INSERT INTO contact (name, email, phone, address) VALUES (?,?,?,?)",
                    [$('#name').val(), $('#email').val(), $('#phone').val(), $('#address').val()],
                    function (tx, res) {
                        console.log("insert #" + res.insertId);
                    });
            $('#modalForm').modal('hide');
            app.funcList();
        }, function (e) {
            console.log("ERROR: " + JSON.stringify(e));
        });
    },
    funcRead: function (pk) {
        btnSubmitState = 'update';
        updatePk = pk;
        dataSource.transaction(function (tx) {
            tx.executeSql("SELECT * FROM contact WHERE id = ?;", [pk], function (tx, res) {
                var data = res.rows.item(0);
                $('#name').val(data.name);
                $('#email').val(data.email);
                $('#phone').val(data.phone);
                $('#address').val(data.address);
                $('#modalForm').modal('show');
            });
        }, function (e) {
            console.log("EROR: ".JSON.stringify(e));
        });
    },
    funcUpdate: function (pk) {
        dataSource.transaction(function (tx) {
            tx.executeSql("UPDATE contact SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?;",
                    [$('#name').val(), $('#email').val(), $('#phone').val(), $('#address').val(), pk],
                    function (tx, res) {
                        app.funcList();
                        $('#modalForm').modal('hide');
                    });
        }, function (e) {
            console.log("EROR: ".JSON.stringify(e));
        });
        $('#modalForm').modal('hide');
    },
    funcDelete: function (pk) {
        dataSource.transaction(function (tx) {
            tx.executeSql("DELETE FROM contact WHERE id = ?;", [pk], function (tx, res) {
                console.log('DELETED ' + pk);
                app.funcList();
            });
        }, function (e) {
            console.log("ERROR: " + JSON.stringify(e));
        });
    },
    funcTruncate: function () {
        dataSource.transaction(function (tx) {
            tx.executeSql("DELETE FROM test_form;", [], function (tx, res) {
            });
            tx.executeSql("DELETE FROM SQLITE_SEQUENCE WHERE name='test_form';", [], function (tx, res) {
            });
            app.funcList();
        }, function (e) {
            console.log("ERROR: " + JSON.stringify(e));
        });
    }
};
