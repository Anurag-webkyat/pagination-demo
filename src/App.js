
var $ = require('jquery');
window.jQuery = $;
window.$ = $;

import Barba from '@barba/core';
import axios from "axios";
import "./App.scss"
import Dropdown from './components/Dropdown/Dropdown';
import Table from './components/table/Table';
import Toaster from './components/Toaster/Toaster';


Barba.init({
    debug: true,
    views: [{
        // 'Home'
        namespace: 'Home',
        beforeEnter(data) {

            // ########## drop down ############//
            // init dropdown
            const dropdown = new Dropdown('.my-select');
            // set selected value
            const selectedOption = "mellow";
            dropdown.updateData(selectedOption);

            const crued = import("./CRUED");
            let table = new Table($("#user")[0]);

            let slno = 0;

            let Userdata = [{
                id: 1,
                name: 'Kannan Uthaman',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
                pageLength: 5,
            }, {
                id: 1,
                name: 'Anurag',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Unni',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Meera',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Sharan',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Niranjana',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Mittu',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Kannan Uthaman',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Anurag',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Unni',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Meera',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Sharan',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Niranjana',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }, {
                id: 1,
                name: 'Mittu',
                phone: '9746197164',
                email: 'kannanuthaman@gmailcom',
                block: false,
            }];

            function fetchData(startLimit, currentPage, rowLimit) {
                axios.post('actions/pagination.php', {
                    startLimit: startLimit,
                    rowPerPage: rowLimit,
                    currentPage: currentPage
                })
                    .then(product => {
                        console.log(product.data);
                        return;
                        product.data.map((row) => {
                            const {  } = row;
                            slno++;

                            const rowContent = [
                                slno,
                                name,
                                phone,
                                email,
                            ];

                            table.addRow(rowContent, id, block);

                            table.actions({
                                edit: "edit-page.html?id=" + id,

                                delete: async (id) => {
                                    const data = {
                                        id: id,
                                    };
                                    crued.then((option) => {
                                        option
                                            ._del_block("action/delete.php", id)
                                            .then((response) => {
                                                if (table.rowCount() == 0) {
                                                    table.empty();
                                                }
                                                new Toaster().trigger({
                                                    content: "You have delete this destination",
                                                    timeout: 2000,
                                                    type: "success",
                                                });
                                            });
                                    });
                                },
                                block: async (id) => {
                                    const data = {
                                        id: id,
                                    };
                                    crued.then((option) => {
                                        option
                                            ._del_block("action/freeze.php", id)
                                            .then((response) => {

                                                new Toaster().trigger({
                                                    content: "You have delete this destination",
                                                    timeout: 2000,
                                                    type: "success",
                                                });
                                            });
                                    });
                                },
                            });
                        })
                    })
            }

            fetchData(0, 1, 10);

            table.setPagination({
                totalPages: Userdata[0].pageLength, // get data from 
      
                startLimit: 0,
            });

        }
    }]
});



// webpack HMR Loading
if (module.hot) module.hot.accept('./App.js');
