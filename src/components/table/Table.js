
import "./table.scss";
import Alert from "../alert/alert";
import "twbs-pagination";
import "./Pagination.scss";



class Table {
    constructor(target) {
        this.target = target;
        this.currentRowId = null;
        this.icons = {
            edit: '<i class="fi fi-rr-pencil"></i>',
            view: '<i class="fi fi-rr-eye"></i>',
            block: '<i class="fi fi-rr-ban"></i>',
            delete: '<i class="fi fi-rr-trash"></i>',
            remark: '<i class="fi fi-rr-comment"></i>'
        };
        this.freeze = null;
        this.paginationElement = null;
    }

    // Clear the table body
    clear() {
        $(this.target).find('tbody').empty();
        $('.table-empty').remove();
    }

    // Add a new row to the table
    addRow(content, id, freeze, color) {
        this.freeze = freeze;
        this.currentRowId = this.generateRowId();
        let row = `<tr block-status="${this.freeze ? 'true' : 'false'}" style="background: ${color ? color : 'inherit'}" row-id="${id}" id="${this.currentRowId}">`;
        content.map(x => row += `<td class="accept-block ${this.freeze ? 'block' : ''}">${x}</td>`);
        row += `</tr>`;
        $(this.target).find('tbody').append(row);
    }


    // Add pagination element after the table
    setPagination(config) {
        if (config) {
            const { totalPages, visiblePages, startLimit } = config;
            let paginationElement = $(this.target).after(`<div class="pagination-holder"></div>`);
            paginationElement.twbsPagination('destroy');
            paginationElement.next('.pagination-holder').twbsPagination({
                totalPages: totalPages,
                visiblePages: 5,
                onPageClick: function (event, page) {

                  
                    // $('#page-content').text('Page ' + page);
                }
            });
        } else {
            console.error('no config passed for pagination');
        }



    }

    // Add action buttons to a row
    actions(buttons) {
        let action = `<td class="actions">`;
        for (let key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                switch (key) {
                    case 'edit':
                        action += `<a title="Edit" ${typeof (buttons[key]) == "string" ? 'href="' + buttons[key] + '"' : ''} class="edit-action table-action-button accept-block ${this.freeze ? 'block' : ''}" href="">${this.icons.edit}</a>`;
                        break;
                    case 'delete':
                        action += `<a title="Delete" ${typeof (buttons[key]) == "string" ? 'href="' + buttons[key] + '"' : ''} class="delete-action table-action-button accept-block ${this.freeze ? 'block' : ''}" href="">${this.icons.delete}</a>`;
                        break;
                    case 'view':
                        action += `<a title="View" ${typeof (buttons[key]) == "string" ? 'href="' + buttons[key] + '"' : ''} class="view-action table-action-button accept-block ${this.freeze ? 'block' : ''}" href="">${this.icons.view}</a>`;
                        break;
                    case 'block':
                        action += `<a title="Block" ${typeof (buttons[key]) == "string" ? 'href="' + buttons[key] + '"' : 'p'} class="block-action table-action-button" href="">${this.icons.block}</a>`;
                        break;
                    case 'remark':
                        action += `<a title="Show Remarks" ${typeof (buttons[key]) == "string" ? 'href="' + buttons[key] + '"' : 'p'} class="remark-action table-action-button" href="">${this.icons.remark}</a>`;
                        break;
                }
            }
        }
        action += `</td>`;
        let currentRow = $('#' + this.currentRowId);
        currentRow.append(action);

        this.setupDeleteAction(currentRow, buttons.delete);
        this.setupBlockAction(currentRow, buttons.block);
        this.setupRemarkAction(currentRow, buttons.remark);
    }

    // Generate a unique row ID
    generateRowId() {
        return (Math.random() + 1).toString(36).substring(7);
    }

    // Set up the event listener for the delete action
    setupDeleteAction(row, deleteAction) {
        let deleteButton = row.find('.delete-action');
        deleteButton.click(e => {
            e.preventDefault();
            const rowId = row.attr('row-id');
            const alerts = new Alert({
                title: 'Are you sure about deleting this?',
                hint: 'This action cannot be undone.',
                cta: {
                    content: 'Delete',
                    color: '#ff4c4c',
                },
                icon: {
                    color: '#ff4c4c',
                    ico: '<i class="fas fa-trash"></i>'
                },
                callback: deleteAction,
                id: rowId,
                action: () => {
                    this.deleteRow(row);
                }
            });
            alerts.show();
        });
    }

    // Set up the event listener for the block action
    setupBlockAction(row, blockAction) {
        let blockButton = row.find('.block-action');
        blockButton.click(e => {
            e.preventDefault();
            const status = row.attr('block-status');
            const rowId = row.attr('row-id');
            const actionText = status === 'false' ? 'block' : 'unblock';
            const alerts = new Alert({
                title: `Are you sure about ${actionText}ing this?`,
                hint: 'This action can be undone.',
                cta: {
                    content: actionText,
                    color: 'orange',
                },
                icon: {
                    color: 'orange',
                    ico: '<i class="fas fa-ban"></i>'
                },
                callback: blockAction,
                id: rowId,
                action: () => {
                    const newStatus = status === 'false' ? 'true' : 'false';
                    row.attr('block-status', newStatus);
                    row.find('.accept-block').toggleClass('block', newStatus === 'true');
                }
            });
            alerts.show();
        });
    }

    // Set up the event listener for the remark action
    setupRemarkAction(row, remarkAction) {
        let remarkButton = row.find('.remark-action');
        remarkButton.click(e => {
            e.preventDefault();
            remarkAction();
        });
    }

    // Hide and delete a row
    deleteRow(row) {
        row.hide();
    }

    // Display an empty table message
    empty(prop) {
        const { button } = prop || {};
        let template = `<div class="table-empty">
            <div class="content">
                <div class="icon">
                    <img src="assets/icons/empty.png"/>
                </div>
                <h3 class>Hey, this table is empty!</h3>`;
        if (button) {
            const { url, content } = button || {};
            template += `<a href="${url}">${content}</a>`;
        }
        template += `</div>
        </div>`;
        this.clear();
        $(this.target).parent().append(template);
    }

    // Get the number of rows in the table
    rowCount() {
        return $(this.target).find('tbody tr').length - 1;
    }

    // Display a loader for the table
    loader() {
        $("#progress").remove();
        let template = `<div id="progress" style="background: #ff7600!important; z-index: 1000000!important;"><b></b><i></i></div>`;
        $(this.target).parent().prepend(template);

        function progress() {
            $("#progress").width("100%").delay(600);
        }

        function stop() {
            $("#progress").remove();
        }

        return {
            progress,
            stop
        };
    }
}

export default Table;
