// import '../libs/css/style.css';
import barba from "../../node_modules/@barba/core/dist/barba.modern.js";
import Button from "./component/button/button.js";
import Header from "./component/header/Header.js";
import Loader from "./component/loader/Loader.js";
import MultipleInput from "./component/multipleInput/multipleInput.js";
import Shimmer from "./component/shimmer/shimmer.js";
import Sidemenu from "./component/sidemenu/Sidemenu.js";
import Table from "./component/table/Table.js";
import Toaster from "./component/toaster/toaster.js";

// sidemenu
const sidemenu = new Sidemenu();
sidemenu.render();
sidemenu.hint({
    target: 'admission',
    content: `new`
});

// header
const header = new Header();
header.render();

// shimmer
const shimmer = new Shimmer();
shimmer.render();

// Toster
const toaster = new Toaster();

// Loader
const loader = new Loader();

// alert
barba.init({
    debug: true,
    views: [{
            namespace: 'dashboard',
            beforeEnter(data) {

                // basic
                sidemenu.active('dashboard');
                console.log()
                header.update('Dashboard', sidemenu.current().find('i')[0].outerHTML);
                loader.load();
                loader.stop();

                // fetch all dashboard count
                fetch('action/fetchAllDashboardData.php')
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data)
                        if (data.length) {
                            $('.lead_count span').text(data[0]['totalLeads'])
                            $('.new_admission span').text(data[0]['newAdmission'])
                            $('.rejected_admission span').text(data[0]['rejectedAdmission'])
                            $('.total_student span').text(data[0]['totalLeads'])
                            $('.total_university span').text(data[0]['totalUniversity'])
                            $('.total_payment span').append(addSeperation(data[0]['totalPayments']))
                            $('.total_due span').append(addSeperation(data[0]['totalDue']))
                            $('.pending_due span').append(addSeperation(data[0]['totalPendingDue']))
                            $('.total_batch span').text(data[0][''])
                        }
                    })
            }
        }, {
            namespace: 'listCategory',
            beforeEnter() {
                loader.load();
                //basic
                sidemenu.active('category');
                header.update('Category List', sidemenu.current().find('i')[0].outerHTML);

                let slno = 0;
                let table = new Table('#category_list');
                const crued = import("../server/CRUED.js");
                // fetch all category
                fetch('action/fetchAllCategory.php')
                    .then(response => response.json())
                    .then(data => {
                        loader.stop();
                        // table.loader().progress();
                        // table.loader().stop();
                        if (data.length) {
                            data.map((row) => {
                                slno++;
                                const {
                                    name,
                                    categoryId,
                                    status,
                                    total
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                }
                                const rowContent = [slno, name, total];
                                table.addRow(rowContent, categoryId, blockStatus);
                                table.actions({
                                    edit: 'edit-category.html?id=' + categoryId,
                                    view: 'course.html?id=' + categoryId,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/disable.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the category`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });
                                            })
                                        });

                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteCategory.php', data).then(response => {
                                                console.log(response)
                                                return;
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: 'add-category.html',
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the category',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: 'add-category.html',
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            })
                            loader.stop();
                        }
                    })

            }
        }, {
            namespace: 'add-category',
            beforeEnter() {
                loader.load();
                //basic
                sidemenu.active('category');
                header.update('Add Category', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();
                $('#add_category_form').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating')
                    const categoryName = $('#categoryName').val();
                    const catPhoto = $('#categoryFile')[0].files[0];
                    let formData = new FormData();
                    formData.append('catName', categoryName);
                    formData.append('image', catPhoto);
                    fetch('action/addCategory.php', {
                            method: 'post',
                            body: formData,
                        })
                        .then(response => response.text())
                        .then(catResult => {
                            console.log(catResult)
                            loader.stop();
                            if (catResult == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'You have added a new Category',
                                    timeout: 2000,
                                    type: 'success',
                                })
                                barba.go('category.html');
                            } else {
                                loader.stop();
                                toaster.trigger({
                                    content: 'Something went wrong !',
                                    timeout: 2000,
                                    type: 'error',
                                })
                            }
                        })
                })

            }
        }, {
            namespace: 'edit_category',
            beforeEnter() {
                loader.load();
                //basic
                sidemenu.active('category');
                header.update('Edit Category', sidemenu.current().find('i')[0].outerHTML)

                const urlVal = window.location.href;
                const splitUrl = urlVal.split('=');
                const categoryId = splitUrl[1];

                // fetch all cotegory for edit
                fetch('action/fetchCategoryForEdit.php?id=' + categoryId)
                    .then(response => response.json())
                    .then(data => {
                        loader.stop();
                        if (data.length) {
                            $('#categoryName').val(data[0]['name']);
                        }
                    })

                const cousreThumbnail = $('#categoryFile');
                cousreThumbnail.on('change', e => {
                    checkFileSize(e.target);
                });

                // edit category
                $('#edit_category_form').submit(e => {
                    e.preventDefault();

                    let button = new Button($('#save_btn')[0]);
                    button.load('Updating');
                    const categoryName = $('#categoryName').val();
                    const catPhoto = $('#categoryFile')[0].files[0];
                    let formData = new FormData();
                    formData.append('categoryName', categoryName);
                    formData.append('image', catPhoto);
                    formData.append('id', categoryId);
                    fetch('action/editCategory.php', {
                            method: 'post',
                            body: formData,
                        })
                        .then(response => response.text())
                        .then(data => {
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'Category Updated',
                                    type: 'success',
                                    timeout: 2000,
                                });
                                barba.go('category.html');
                            }
                        })
                })
            }
        }, {
            namespace: 'add_course',
            beforeEnter() {
                // basic setup
                loader.load();
                sidemenu.active('category');
                header.update('Add Course', sidemenu.current().find('i')[0].outerHTML)
                const id = urlVal(window.location.href);
                loader.stop();

                // while typing on course input the discount input disabled attribute get removed
                $('#courseAmount').on('keyup', (e) => {
                    let val = e.target.value;
                    if (val != "") {
                        $('#courseDiscountAmount').removeAttr('disabled');
                    } else {
                        $('#courseDiscountAmount').attr('disabled', true);

                    }
                });

                // checking course fee added or not while applying installments
                // if it is not check the course input gets focused
                $('#cb2').click(function () {
                    let courseFee = $('#courseAmount').val();
                    if (courseFee != "") {
                        if (!$(this).is(':checked')) {
                            $('.multiple-inputs').hide();
                            $('.new-one').remove();
                            $('.multiple input').val('');
                        } else {
                            $('.multiple-inputs').show();
                            $('.multiple-inputs')[0].scrollIntoView();
                        }
                    } else {
                        $('#cb2').prop('checked', false)
                        $('#courseAmount').focus();
                        $('#courseAmount')[0].scrollIntoView();
                    }
                });

                // a function for making multiple input
                new MultipleInput($('.multiple input'), 'New Amount');

                // fetching all universities and inserting
                fetch('action/fetchAllUniversity.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {

                            data.map(x => {
                                const {
                                    university_id,
                                    name
                                } = x;

                                $('#university_drop').append(` <option value="${university_id}">${name}</option>`);
                            })
                        } else {

                        }
                    })


                // checking course  thumbnail and allowing form submision
                const cousreThumbnail = $('#courseFile');
                cousreThumbnail.on('change', e => {
                    // console.log(e.target)
                    if (checkFileSize(e.target)) {

                        $('#add_course_form').submit(e => {
                            e.preventDefault();

                            let button = new Button($('#save_btn')[0]);
                            button.load('Creating');
                            const courseName = $('#courseName').val();
                            const courseAmount = $('#courseAmount').val() != '' ? $('#courseAmount').val() : 0;
                            const courseDiscountAmount = $('#courseDiscountAmount').val() != "" ? $('#courseDiscountAmount').val() : 0;
                            const courseText = $('#courseDes').val();
                            const universityId = $('#university_drop').val();
                            const courseImage = $('#courseFile')[0].files[0];
                            // if the session is checked or not
                            let sessionCheck = 0;
                            // is the installments added correct based on course/ discount amount
                            let installmentValidationError = false;
                            // if the installment added or not
                            let installMentData = [];

                            if ($("#cb1").is(':checked')) {
                                sessionCheck = 1;
                            }
                            let instalmentStatus = 0;
                            if ($("#cb2").is(':checked')) {

                                $('.multiple-inputs input').each(function () {
                                    if ($(this).val()) {
                                        instalmentStatus = 1;
                                        installMentData.push($(this).val());
                                    }
                                });
                                let courseFee = $('#courseAmount').val();
                                let discountFee = $('#courseDiscountAmount').val();
                                if (discountFee != "") {
                                    calcInstallment(discountFee);
                                } else {
                                    calcInstallment(courseFee);
                                }

                            }
                            // function for calculating installment depends on course/discount amount
                            function calcInstallment(amount) {
                                // alert(amount)
                                let installmentAmount = 0;
                                $('.multiple-inputs input').each(function () {
                                    if ($(this).val()) {
                                        installmentAmount += Number($(this).val());
                                    }
                                });

                                if (Number(installmentAmount) == Number(amount)) {
                                    installmentValidationError = false;
                                } else {
                                    toaster.trigger({
                                        type: 'error',
                                        timeout: 2000,
                                        content: 'Add Correct Installments'
                                    });
                                    installmentValidationError = true;

                                }
                            }
                            if (installmentValidationError) {
                                button.stop();
                            } else {


                                let formData = new FormData();
                                formData.append('courseName', courseName);
                                formData.append('courseAmount', courseAmount);
                                formData.append('courseDiscountAmount', courseDiscountAmount);
                                formData.append('courseText', courseText);
                                formData.append('image', courseImage);
                                formData.append('universityId', universityId);
                                formData.append('sessionCheck', sessionCheck);
                                formData.append('instalmentStatus', instalmentStatus);
                                formData.append('installMentData', JSON.stringify(installMentData));
                                formData.append('id', id);
                                fetch('action/addCourse.php', {
                                        method: 'post',
                                        body: formData
                                    })
                                    .then(response => response.text())
                                    .then(courseResult => {
                                        console.log(courseResult);
                                        if (courseResult == 1) {
                                            button.stop();
                                            toaster.trigger({
                                                content: 'You have added a new Course',
                                                timeout: 2000,
                                                type: 'success',
                                            })
                                            barba.go('course.html?id=' + id);
                                        } else {
                                            toaster.trigger({
                                                content: 'Server not responding !',
                                                type: 'error',
                                                timeout: 1000,
                                            });
                                            button.stop();
                                        }
                                    })
                            }
                        })
                    }
                });
            }
        }, {
            namespace: 'edit_course',
            beforeEnter() {
                loader.load();
                sidemenu.active('category');
                header.update('Edit Course', sidemenu.current().find('i')[0].outerHTML)

                const urlVal = window.location.href;
                const splitUrl = urlVal.split('=');
                const courseIdSplit = splitUrl[1].split('&');
                const courseId = courseIdSplit[0];
                const catId = splitUrl[2];
                // fetch all course for edit
                fetch('action/fetchCourseForEdit.php?id=' + courseId)
                    .then(response => response.json())
                    .then(data => {
                        loader.stop();
                        console.log(data)
                        if (data.length) {
                            const {
                                name,
                                courseFee,
                                courseDiscountFee,
                                discription,
                                sessionStatus,
                                university,
                                installmentStatus
                            } = data[0];
                            $('#courseName').val(name);
                            $('#courseAmount').val(courseFee);
                            $('#courseDiscountAmount').val(courseDiscountFee);
                            $('#courseDes').val(discription);
                            // if (sessionStatus == 1) {
                            //     $('#cb1').attr('checked', 'true');
                            // }
                            if (installmentStatus == 1) {
                                // installment

                                new MultipleInput($('.multiple input'), 'New Amount');
                                // checking course fee added or not while applying installments
                                // if it is not check the course input gets focused

                                $('#cb2').click(function () {
                                    let courseFee = $('#courseAmount').val();
                                    if (courseFee != "") {
                                        if (!$(this).is(':checked')) {
                                            $('.multiple-inputs').hide();
                                            // $('.new-one').remove();
                                            // $('.multiple input').val('');



                                        } else {
                                            $('.multiple-inputs').show();
                                            $('.multiple-inputs')[0].scrollIntoView();
                                        }
                                    } else {
                                        $('#cb2').prop('checked', false)
                                        $('#courseAmount').focus();
                                        $('#courseAmount')[0].scrollIntoView();
                                    }
                                });
                                $('#cb2').click();

                            }
                            return university;
                        }
                    }).then((univId) => {
                        // fetching all universities and inserting
                        fetch('action/fetchAllUniversity.php')
                            .then(response => response.json())
                            .then(data => {
                                console.log(data)
                                if (data.length) {
                                    let template = '';
                                    data.map(x => {
                                        const {
                                            university_id,
                                            name
                                        } = x;
                                        template += ` <option ${univId == university_id ? 'selected' : ''} value="${university_id}">${name}</option>`;
                                    })
                                    $('#university_drop').empty().append(template);
                                } else {

                                }
                            })
                    }).then(() => {
                        fetch('action/fetchCourseInstalmentForEdit.php?id=' + courseId)
                            .then(response => response.json())
                            .then(data => {
                                console.log(data)
                                data.map((x, i) => {
                                    console.log(i)
                                    const {
                                        amount
                                    } = x;
                                    $('.multiple-inputs .input-holder input').eq(i).val(amount);
                                    if (i + 1 < data.length)
                                        $('.multiple-inputs .input-holder').eq(0).find('.increment-button').click();
                                })
                            })

                    })


                // edit course
                // $('#edit_course_form').submit(e => {
                //     e.preventDefault();
                //     let button = new Button($('#save_btn')[0]);
                //     button.load('Updating');
                //     const courseName = $('#courseName').val();
                //     const courseAmount = $('#courseAmount').val();
                //     const courseDiscountAmount = $('#courseDiscountAmount').val();
                //     const courseDiscription = $('#courseDes').val();
                //     const courseImage = $('#courseFile')[0].files[0];
                //     let formData = new FormData();
                //     formData.append('courseName', courseName);
                //     formData.append('courseAmount', courseAmount);
                //     formData.append('courseDiscountAmount', courseDiscountAmount);
                //     formData.append('courseDiscription', courseDiscription);
                //     formData.append('image', courseImage);
                //     formData.append('id', courseId);
                //     fetch('action/editCourse.php', {
                //             method: 'post',
                //             body: formData
                //         })
                //         .then(response => response.text())
                //         .then(data => {
                //             console.log(data)
                //             if (data == 1) {
                //                 button.stop();
                //                 toaster.trigger({
                //                     content: 'Course Updated',
                //                     type: 'success',
                //                     timeout: 2000,
                //                 });
                //                 barba.go('course.html?id=' + catId);
                //             } else {

                //             }
                //         })
                // })





                // while typing on course input the discount input disabled attribute get removed
                $('#courseAmount').on('keyup', (e) => {
                    let val = e.target.value;
                    if (val != "") {
                        $('#courseDiscountAmount').removeAttr('disabled');
                    } else {
                        $('#courseDiscountAmount').attr('disabled', true);

                    }
                });


                // fetching all universities and inserting
                fetch('action/fetchAllUniversity.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {

                            data.map(x => {
                                const {
                                    university_id,
                                    name
                                } = x;

                                $('#university_drop').append(` <option value="${university_id}">${name}</option>`);
                            })
                        } else {

                        }
                    })


                const cousreThumbnail = $('#courseFile');
                cousreThumbnail.on('change', e => {
                    // console.log(e.target)
                    checkFileSize(e.target);

                });
                $('#edit_course_form').submit(e => {
                    e.preventDefault();

                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating');
                    const courseName = $('#courseName').val();
                    const courseAmount = $('#courseAmount').val() != '' ? $('#courseAmount').val() : 0;
                    const courseDiscountAmount = $('#courseDiscountAmount').val() != "" ? $('#courseDiscountAmount').val() : 0;
                    const courseText = $('#courseDes').val();
                    const universityId = $('#university_drop').val();
                    const courseImage = $('#courseFile')[0].files[0];

                    // is the installments added correct based on course/ discount amount
                    let installmentValidationError = false;
                    // if the installment added or not
                    let installMentData = [];

                    let file_error_state = false;


                    let instalmentStatus = 0;
                    if ($("#cb2").is(':checked')) {

                        $('.multiple-inputs input').each(function () {
                            if ($(this).val()) {
                                instalmentStatus = 1;
                                installMentData.push($(this).val());
                            }
                        });
                        let courseFee = $('#courseAmount').val();
                        let discountFee = $('#courseDiscountAmount').val();
                        if (discountFee != "") {
                            calcInstallment(discountFee);
                        } else {
                            calcInstallment(courseFee);
                        }

                    }



                    // function for calculating installment depends on course/discount amount
                    function calcInstallment(amount) {
                        // alert(amount)
                        let installmentAmount = 0;
                        $('.multiple-inputs input').each(function () {
                            if ($(this).val()) {
                                installmentAmount += Number($(this).val());
                            }
                        });

                        if (Number(installmentAmount) == Number(amount)) {
                            installmentValidationError = false;
                        } else {
                            toaster.trigger({
                                type: 'error',
                                timeout: 2000,
                                content: 'Add Correct Installments'
                            });
                            installmentValidationError = true;

                        }
                    }
                    let feeError = false;

                    function checkFee() {
                        let courseFee = $('#courseAmount').val();
                        let discountFee = $('#courseDiscountAmount').val();

                        if (discountFee !== "") {

                            if (Number(courseFee) < Number(discountFee)) {

                                feeError = true;
                                toaster.trigger({
                                    content: 'Discount Fee should be smaller than course Fee',
                                    timeout: 2000,
                                    type: 'error'
                                })
                                $('#courseAmount')[0].scrollIntoView();
                                $('#courseAmount').focus();
                            }
                        }
                    }
                    checkFee();

                    if (installmentValidationError || feeError) {
                        button.stop();
                    } else {

                        let formData = new FormData();
                        formData.append('courseId', courseId);
                        formData.append('courseName', courseName);
                        formData.append('courseAmount', courseAmount);
                        formData.append('courseDiscountAmount', courseDiscountAmount);
                        formData.append('courseText', courseText);
                        formData.append('image', courseImage);
                        formData.append('universityId', universityId);

                        formData.append('instalmentStatus', instalmentStatus);
                        formData.append('installMentData', JSON.stringify(installMentData));
                        fetch('action/editCourse.php', {
                                method: 'post',
                                body: formData
                            })
                            .then(response => response.text())
                            .then(courseResult => {
                                console.log(courseResult);
                                if (courseResult == 1) {
                                    button.stop();
                                    toaster.trigger({
                                        content: 'You have added a new Course',
                                        timeout: 2000,
                                        type: 'success',
                                    })
                                    barba.go('course.html?id=' + courseId);
                                } else {
                                    toaster.trigger({
                                        content: 'Server not responding !',
                                        type: 'error',
                                        timeout: 1000,
                                    });
                                    button.stop();
                                }
                            })
                    }
                })


            }
        }, {
            namespace: 'listCourse',
            beforeEnter() {
                loader.load();
                //basic
                sidemenu.active('category');
                header.update('Course List', sidemenu.current().find('i')[0].outerHTML);

                let slno = 0;
                let table = new Table('#mytable');
                const crued = import("../server/CRUED.js");
                let id = urlVal(window.location.href);
                $('.options a').attr('href', 'add-course.html?id=' + id);

                // fetch all course
                fetch('action/fetchAllCourse.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {

                            loader.stop();
                            data.map((row) => {
                                slno++;
                                const {
                                    name,
                                    courseId,
                                    course_fee,
                                    session_status,
                                    status,
                                    total
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                } else if (status == 1) {
                                    blockStatus = false;
                                }

                                const rowContent = [slno, name, course_fee];
                                table.addRow(rowContent, courseId, blockStatus);
                                table.actions({
                                    edit: 'edit-course.html?id=' + courseId + '&catId=' + id,

                                    view: session_status == 1 ? 'session.html?cid=' + courseId : 'subject.html?cid=' + courseId,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/blockCourse.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the category`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteCourse.php', data).then(response => {
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: 'add-course.html',
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the category',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: 'add-course.html?id=' + id,
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            })
                            loader.stop();
                        }
                    })
            },
        }, {
            namespace: 'add_subject',
            beforeEnter() {
                let urlVal = window.location.href;
                let splitUrl = urlVal.split('?');
                let urlId = splitUrl[1].split('=')[1];
                let checkUrl = splitUrl[1].split('=')[0];
                //basic
                loader.load();
                sidemenu.active('category');
                header.update('Add Subject', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                $('#add_subject_form').submit((e) => {
                    e.preventDefault()
                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating');
                    const subjectName = $('#subjectName').val();
                    const subJectData = {
                        urlId: urlId,
                        checkUrl: checkUrl,
                        subjectName: subjectName
                    }
                    fetch('action/addSubject.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(subJectData)
                        })
                        .then(response => response.text())
                        .then(data => {
                            // console.log(data)
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'You have added a new Subject',
                                    timeout: 2000,
                                    type: 'success',
                                })
                                window.history.back();
                            } else {
                                button.stop();
                            }
                        })
                })
            }
        }, , {
            namespace: 'list_session',
            beforeEnter() {
                let slno = 0;

                loader.load();
                sidemenu.active('category');
                header.update('Sessions', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                const id = urlVal(window.location.href);
                const urlId = id;
                // skip session url
                $('#skip_session').attr('href', 'subject.html?cid=' + id);

                // create session url
                $('#createSession').attr('href', 'add-session.html?id=' + id);

                const crued = import("../server/CRUED.js");
                let table = new Table($('#session_list')[0]);

                // fetch all session
                fetch('action/fetchAllSession.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {
                            loader.stop();
                            data.map((row) => {
                                slno++;
                                const {
                                    name,
                                    sessionId,
                                    status,
                                    total
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                } else if (status == 1) {

                                    blockStatus = false;
                                }

                                const rowContent = [slno, name, total];
                                table.addRow(rowContent, sessionId, blockStatus);
                                table.actions({
                                    edit: 'edit-session.html?id=' + sessionId,
                                    view: 'subject.html?sid=' + sessionId,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/blockSession.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the subject`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteSession.php', data).then(response => {
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: 'add-session.html?id=' + urlId,
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the subject',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: 'add-session.html?id=' + urlId,
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            });
                            loader.stop();

                        }
                    })

            }
        }, , {
            namespace: 'add_session',
            beforeEnter() {
                loader.load();
                sidemenu.active('category');
                header.update('Add Session', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                const id = urlVal(window.location.href);

                $('#add_session_form').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating')
                    const sessionName = $('#sessionName').val();
                    const sessionData = {
                        sessionName: sessionName,
                        courseId: id,
                    }
                    fetch('action/addSession.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(sessionData)
                        })
                        .then(response => response.text())
                        .then(catResult => {
                            console.log(catResult)
                            if (catResult == 1) {
                                loader.stop();
                                button.stop();
                                toaster.trigger({
                                    content: 'You have added a new Session',
                                    timeout: 2000,
                                    type: 'success',
                                })
                                window.history.back();
                            } else {
                                loader.stop();
                                toaster.trigger({
                                    content: 'Something went wrong !',
                                    timeout: 2000,
                                    type: 'error',
                                })
                            }
                        })
                })
            }
        }, , {
            namespace: 'edit_session',
            beforeEnter() {
                loader.load();
                sidemenu.active('category');
                header.update('Edit Session', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                const id = urlVal(window.location.href);

                // fetch session for edit
                fetch('action/fetchSessionForEdit.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        $('#session_name').val(data[0]['name'])
                    })


                // update session
                $('#edit_form_session').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Updating');
                    const session_name = $('#session_name').val();
                    const sessionData = {
                        session_name: session_name,
                        id: id
                    }
                    fetch('action/editSession.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(sessionData)
                        })
                        .then(response => response.text())
                        .then(data => {
                            // console.log(data)
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'session Updated',
                                    type: 'success',
                                    timeout: 2000,
                                });
                                setTimeout(() => {
                                    window.history.back();
                                }, 500);
                            } else {
                                button.stop();
                            }
                        })
                })

            }
        }, {
            namespace: 'list_subject',
            beforeEnter() {
                let slno = 0;
                let urlVal = window.location.href;
                let splitUrl = urlVal.split('?');
                let urlId = splitUrl[1].split('=')[1];
                let checkUrl = splitUrl[1].split('=')[0];
                if (checkUrl == 'cid') {
                    $('.options a').attr('href', 'add-subject.html?cid=' + urlId);
                } else {
                    $('.options a').attr('href', 'add-subject.html?sid=' + urlId);
                }
                //basic
                loader.load();
                sidemenu.active('category');
                header.update('List Subject', sidemenu.current().find('i')[0].outerHTML);
                const crued = import("../server/CRUED.js");
                let table = new Table($('#subject_table')[0]);
                loader.stop();

                const subjectData = {
                    urlId: urlId,
                    checkUrl: checkUrl
                };

                // fetch all subject
                fetch('action/fetchAllSubject.php', {
                        method: 'post',
                        headers: {
                            contentType: 'application/json'
                        },
                        body: JSON.stringify(subjectData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        if (data.length) {
                            loader.stop();
                            data.map((row) => {
                                slno++;
                                const {
                                    name,
                                    subjectId,
                                    status,
                                    total
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                } else if (status == 1) {

                                    blockStatus = false;
                                }

                                const rowContent = [slno, name, total];
                                table.addRow(rowContent, subjectId, blockStatus);
                                table.actions({
                                    edit: 'edit-subject.html?id=' + subjectId + '&courId=' + urlId,
                                    view: 'lessons.html?id=' + subjectId,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/blockSubject.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the subject`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteSubject.php', data).then(response => {
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: checkUrl == 'cid' ? 'add-subject.html?cid=' + urlId : 'add-subject.html?sid=' + urlId,
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the subject',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: checkUrl == 'cid' ? 'add-subject.html?cid=' + urlId : 'add-subject.html?sid=' + urlId,
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            });
                            loader.stop();

                        }
                    })
            }
        },
        {
            namespace: 'edit_subject',
            beforeEnter() {
                const urlVal = window.location.href;
                const splitUrl = urlVal.split('=');
                const courseId = splitUrl[2];
                const splitSubId = splitUrl[1].split('&');
                const subId = splitSubId[0];
                //basic
                loader.load();
                sidemenu.active('category');
                header.update('Edit Subject', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();


                // fetch subject for edit
                fetch('action/fetchSubjectForEdit.php?id=' + subId)
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data)
                        $('#subjectName').val(data[0]['name'])
                    })


                // update subject
                $('#edit_subject_name').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Updating');
                    const subjectName = $('#subjectName').val();
                    const subData = {
                        subjectName: subjectName,
                        id: subId
                    }
                    fetch('action/editSubject.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(subData)
                        })
                        .then(response => response.text())
                        .then(data => {
                            // console.log(data)
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'Course Updated',
                                    type: 'success',
                                    timeout: 2000,
                                });
                                barba.go('subject.html?sid=' + courseId);
                            } else {
                                button.stop();
                            }
                        })
                })
            }
        }, {
            namespace: 'list_lessons',
            beforeEnter() {
                let slno = 0;
                const id = urlVal(window.location.href);
                loader.load();
                sidemenu.active('category');
                header.update('List Lesson', sidemenu.current().find('i')[0].outerHTML);

                $('.options a').attr('href', 'add-lessons.html?id=' + id);

                const crued = import("../server/CRUED.js");
                let table = new Table($('#Lesson_table')[0]);

                // list all lessons
                fetch('action/fetchAllLessons.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        if (data.length) {
                            loader.stop();
                            data.map((row) => {
                                slno++;
                                const {
                                    name,
                                    lessonId,
                                    status,
                                    total
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                } else if (status == 1) {

                                    blockStatus = false;
                                }

                                const rowContent = [slno, name, total];
                                table.addRow(rowContent, lessonId, blockStatus);
                                table.actions({
                                    edit: 'edit-lesson.html?id=' + lessonId,
                                    view: 'lesson-videos.html?id=' + lessonId,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/blockLesson.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the lesson`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteLesson.php', data).then(response => {
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: 'add-lessons.html',
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the Lesson',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: 'add-lessons.html?id=' + id,
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            });
                            loader.stop();

                        }
                    })
            }
        }, {
            namespace: 'add_lessons',
            beforeEnter() {
                const id = urlVal(window.location.href);
                loader.load();
                sidemenu.active('category');
                header.update('Add Lesson', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                // add lesson
                $('#add_lesson_form').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating');
                    const lessonName = $('#lessonName').val();
                    const lessonData = {
                        id: id,
                        lessonName: lessonName
                    }
                    fetch('action/addLesson.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(lessonData)
                        })
                        .then(response => response.text())
                        .then(data => {
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'You have added a new Subject',
                                    timeout: 2000,
                                    type: 'success',
                                })

                                window.history.back();

                            } else {
                                toaster.trigger({
                                    content: 'Something went wrong try again !',
                                    timeout: 2000,
                                    type: 'error',
                                })
                                button.stop();
                            }
                        })
                })
            }
        }, {
            namespace: 'edit_lesson',
            beforeEnter() {
                const id = urlVal(window.location.href);
                loader.load();
                sidemenu.active('category');
                header.update('Edit Lesson', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                // fetch lesson name
                fetch('action/fetchLessionNameForEdit.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {
                            const {
                                lessionName
                            } = data[0];

                            $('#lessonName').val(lessionName);
                        }
                    })

                // edit lesson
                $('#edit_lesson_form').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Updating');
                    const lessionName = $('#lessonName').val();
                    fetch('action/editLession.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                lessionName: lessionName,
                                id: id
                            })
                        })
                        .then(response => response.text())
                        .then(data => {
                            button.stop();
                            if (data == 1) {
                                toaster.trigger({
                                    content: 'Updated Succesfully',
                                    timeout: 2000,
                                    type: 'success',
                                })

                                window.history.back();

                            } else {
                                toaster.trigger({
                                    content: 'Something went wrong try again !',
                                    timeout: 2000,
                                    type: 'error',
                                })
                            }
                        })
                })

            }
        }, {
            namespace: 'list_videos',
            beforeEnter() {

                loader.load();
                sidemenu.active('category');
                header.update('List Videos', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                let slno = 0;
                const id = urlVal(window.location.href);

                loader.load();
                sidemenu.active('category');
                header.update('List Videos', sidemenu.current().find('i')[0].outerHTML);

                $('.options a').attr('href', 'add-video.html?id=' + id);

                const crued = import("../server/CRUED.js");
                let table = new Table($('#video_table')[0]);

                // list all video
                fetch('action/fetchAllVideos.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        if (data.length) {
                            loader.stop();
                            data.map((row) => {
                                slno++;
                                const {
                                    vid,
                                    name,
                                    videoId,
                                    status,
                                } = row;
                                let blockStatus = false;
                                if (status == 2) {
                                    blockStatus = true;
                                } else if (status == 1) {

                                    blockStatus = false;
                                }

                                const rowContent = [slno, name, videoId];
                                table.addRow(rowContent, vid, blockStatus);
                                table.actions({
                                    edit: 'edit-video.html?id=' + vid,
                                    block: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/blockVideo.php', data).then(response => {
                                                toaster.trigger({
                                                    content: `You have ${response ? 'block' : 'unblocked'} the Video`,
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                    delete: async (id) => {
                                        const data = {
                                            id: id
                                        }
                                        crued.then(option => {
                                            option._del_block('action/deleteVideo.php', data).then(response => {
                                                if (table.rowCount() == 0) {
                                                    table.empty({
                                                        button: {
                                                            url: 'add-video.html?id=' + id,
                                                            content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                        }
                                                    });
                                                }
                                                toaster.trigger({
                                                    content: 'You have delete the Video',
                                                    timeout: 2000,
                                                    type: 'success',
                                                });

                                            });
                                        });
                                    },
                                });
                            })
                        } else {
                            table.empty({
                                button: {
                                    url: 'add-video.html?id=' + id,
                                    content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                }
                            });
                            loader.stop();

                        }
                    })
            },
        }, {
            namespace: 'edit_video',
            beforeEnter() {
                loader.load();
                sidemenu.active('category');
                header.update('Edit Videos', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();
                const videoRowId = urlVal(window.location.href);

                // fetch video name and id for edit
                fetch('action/fetchVideoDataForEdit.php?id=' + videoRowId)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        if (data.length) {
                            const {
                                videoName,
                                videoApi
                            } = data[0];

                            $('#videoName').val(videoName);
                            $('#videoApi').val(videoApi);
                        }
                    })

                // edit video
                $('#edit_video').submit(e => {
                    e.preventDefault();
                    let button = new Button($('#save_btn')[0]);
                    button.load('Updating');
                    const videoName = $('#videoName').val();
                    const videoApi = $('#videoApi').val();
                    fetch('action/editVideo.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                videoName: videoName,
                                videoApi: videoApi,
                                id: videoRowId
                            })
                        })
                        .then(response => response.text())
                        .then(data => {
                            button.stop();
                            if (data == 1) {
                                toaster.trigger({
                                    content: 'Updated Succesfully',
                                    timeout: 2000,
                                    type: 'success',
                                })

                                window.history.back();

                            } else {
                                toaster.trigger({
                                    content: 'Something went wrong try again !',
                                    timeout: 2000,
                                    type: 'error',
                                })
                            }
                        })
                })
            },
        }, {
            namespace: 'add_video',
            beforeEnter() {

                const id = urlVal(window.location.href);

                loader.load();
                sidemenu.active('category');
                header.update('Add Videos', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                // add video
                $('#add_video_form').submit((e) => {
                    e.preventDefault()
                    let button = new Button($('#save_btn')[0]);
                    button.load('Creating..');
                    const videoTitle = $('#videoName').val();
                    const videoId = $('#VideoId').val();
                    const videoData = {
                        videoTitle: videoTitle,
                        videoId: videoId,
                        lessionId: id
                    }

                    fetch('action/addVideo.php', {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify(videoData)
                        })
                        .then(response => response.text())
                        .then(data => {
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'You have added a new video',
                                    timeout: 2000,
                                    type: 'success',
                                })
                                history.back();
                            } else {
                                toaster.trigger({
                                    content: 'Server not responding !',
                                    type: 'error',
                                    timeout: 1000,
                                });
                                button.stop();
                            }
                        })
                })


            },
        }, {
            namespace: 'add_university',
            beforeEnter() {
                loader.load();
                sidemenu.active('university');
                header.update('Add University', sidemenu.current().find('i')[0].outerHTML)
                loader.stop();
                $('#add_university_form').submit(e => {
                    e.preventDefault();
                    const universityName = $('#universityName').val();
                    fetch('./action/addUniversity.php', {
                            method: 'POST',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                universityName
                            })
                        }).then(response => response.json())
                        .then(data => {
                            if (data == 1) {
                                history.back();
                                toaster.trigger({
                                    content: 'New University Added',
                                    type: 'success',
                                    timeout: 2000
                                })
                            }
                        });
                })

            }
        }, {
            namespace: 'listUniversity',
            beforeEnter() {
                let slno = 0;
                let courseCount = 0;
                loader.load();
                sidemenu.active('university');
                header.update('University List', sidemenu.current().find('i')[0].outerHTML)

                $('.options a').attr('href', 'add-university.html');

                let table = new Table('#university_list');
                fetchAllUniversity();
                const crued = import("../server/CRUED.js");
                // fetch all leads
                function fetchAllUniversity() {
                    fetch('action/fetchAllUniversity.php')
                        .then(response => response.json())
                        .then(data => {
                            if (data.length) {
                                loader.stop();
                                data.map((row) => {
                                    slno++;
                                    const {
                                        university_id,
                                        name,
                                        status,
                                    } = row;
                                    let blockStatus = false;
                                    if (status == 2) {
                                        blockStatus = true;
                                    } else if (status == 1) {

                                        blockStatus = false;
                                    }

                                    const rowContent = [slno, name, courseCount];
                                    table.addRow(rowContent, university_id, blockStatus);
                                    table.actions({
                                        edit: 'edit-university.html?id=' + university_id,
                                        block: async (id) => {
                                            const data = {
                                                id: id
                                            }
                                            crued.then(option => {
                                                option._del_block('action/blockUniversity.php', data).then(response => {
                                                    toaster.trigger({
                                                        content: `You have ${response ? 'block' : 'unblocked'} the Video`,
                                                        timeout: 2000,
                                                        type: 'success',
                                                    });

                                                });
                                            });
                                        },
                                        delete: async (id) => {
                                            const data = {
                                                id: id
                                            }
                                            crued.then(option => {
                                                option._del_block('action/deleteUniversity.php', data).then(response => {
                                                    if (table.rowCount() == 0) {
                                                        table.empty({
                                                            button: {
                                                                url: 'add-university.html?id=' + urlVal(window.location.href),
                                                                content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                                            }
                                                        });
                                                    }
                                                    toaster.trigger({
                                                        content: 'You have delete the Video',
                                                        timeout: 2000,
                                                        type: 'success',
                                                    });

                                                });
                                            });
                                        },
                                    });
                                })
                            } else {
                                // console.log(table)
                                table.empty({
                                    button: {
                                        url: 'add-university.html',
                                        content: `Let's Create &nbsp; <i class="fas fa-plus"></i>`
                                    }
                                });

                                loader.stop();

                            }
                        })
                }



            }
        }, {
            namespace: 'edit_university',
            beforeEnter() {
                loader.load();
                sidemenu.active('university');
                header.update('Edit University', sidemenu.current().find('i')[0].outerHTML);
                const id = urlVal(window.location.href);
                // fetch university name for edit
                fetch('action/fetchUniversityDataForEdit.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {
                            loader.stop();
                            $('#university_name').val(data[0]['name']);
                        } else {
                            loader.stop();
                        }
                    });

                // update
                $('#edit_university_form').submit(e => {
                    e.preventDefault();
                    const value = $('#university_name').val();

                    if (value) {
                        fetch('action/editUniversity.php', {
                                method: 'POST',
                                headers: {
                                    contentType: 'application/json'
                                },
                                body: JSON.stringify({
                                    value,
                                    id
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data == 1) {
                                    history.back();
                                    toaster.trigger({
                                        content: 'University Updated !',
                                        timeout: 2000,
                                        type: 'success',
                                    })
                                }
                            })
                    }
                });


            }
        }, {
            namespace: 'create_student',
            beforeEnter() {
                loader.load();
                sidemenu.active('createstudent');
                header.update('Create Student', sidemenu.current().find('i')[0].outerHTML)
                // shimmer.show();
                let json = [{
                    id: 1,
                    name: 'kannan Uthaman',
                    course: 'BCA',
                }, {
                    id: 2,
                    name: 'Anurag Mohan',
                    course: 'BCOM',
                }, {
                    id: 3,
                    name: 'Shareek Ali',
                    course: 'BBA',
                }];
                let table = new Table('#mytable');
                loader.stop();
                json.map(row => {
                    const {
                        id,
                        name,
                        course
                    } = row;
                    const rowContent = [id, name, course];
                    table.addRow(rowContent);
                    table.actions({
                        edit: 'somewhere.html',
                        view: 'somewhere.html',
                        block: async (id) => {

                        },
                        delete: async (id) => {

                        },

                    });
                })

                function mycallback() {

                }
            }
        }, {
            namespace: 'leads',
            beforeEnter() {
                let slno = 0;
                let startLimit = 0;
                let endLimit = 10;
                let searchData = '';

                loader.load();
                sidemenu.active('leads');
                header.update('Leads from App', sidemenu.current().find('i')[0].outerHTML);

                $('#searchFilter').keyup(function () {
                    searchData = $(this).val();
                    splitPage(10);
                })

                let table = new Table('#category_list');
                const crued = import("../server/CRUED.js");

                // fetch all leads
                function fetchAllLeads(limit) {
                    slno = startLimit;
                    table.clear();
                    fetch('action/fetchAllLeads.php?limit=' + limit + '&searchData=' + searchData)
                        .then(response => response.json())
                        .then(data => {
                            if (data.length) {
                                loader.stop();
                                data.map(row => {
                                    slno++;
                                    const {
                                        id,
                                        name,
                                        email,
                                        phone,
                                        date,
                                        read_status
                                    } = row;
                                    const rowContent = [slno, name, email, phone, date];
                                    table.addRow(rowContent, id, false, read_status == 1 ? '#f0fff8!important' : '');
                                    table.actions({
                                        view: 'lead-info.html?id=' + id,
                                        delete: async (id) => {
                                            const data = {
                                                id: id
                                            }
                                            crued.then(option => {
                                                option._del_block('action/deleteLead.php', data).then(response => {
                                                    if (table.rowCount() == 0) {
                                                        table.empty();
                                                    }
                                                    toaster.trigger({
                                                        content: 'You have delete the lead',
                                                        timeout: 2000,
                                                        type: 'success',
                                                    });

                                                });
                                            });
                                        },

                                    });
                                })
                            } else {
                                table.empty();
                                loader.stop();
                            }

                        })
                }

                function splitPage(splitLimit) {

                    fetch('action/splitPageLeads.php?limit=' + splitLimit + '&searchData=' + searchData)
                        .then(response => response.json())
                        .then(pdata => {
                            console.log(pdata[0]['length'])
                            if (pdata[0]['length'] != '') {
                                let pageSplitLen = pdata[0]['length']
                                if (pageSplitLen == 1) {
                                    slno = 0;
                                    startLimit = 0;
                                    $('.pagination-sm').hide();
                                    fetchAllLeads(startLimit + ',' + endLimit)
                                } else {
                                    $('.pagination-sm').show();
                                    $.getScript('../src/plugin/pagination.js', function () {
                                        $('#pagination-demo').twbsPagination('destroy')
                                        $('#pagination-demo').twbsPagination({
                                            totalPages: pageSplitLen,
                                            visiblePages: endLimit,
                                            onPageClick: function (event, page) {
                                                if (page == 1) {
                                                    slno = 0;
                                                    startLimit = 0;
                                                } else {
                                                    let multiple = page - 1
                                                    startLimit = endLimit * multiple
                                                }
                                                slno = startLimit;
                                                fetchAllLeads(startLimit + ',' + endLimit)
                                            }
                                        });
                                    })
                                }
                            } else {
                                $('.pagination-sm').hide();
                                table.empty();
                            }
                        })
                }


                splitPage(10);

            }
        }, {
            namespace: 'innerLeads',
            beforeEnter() {
                const id = urlVal(window.location.href);
                loader.load();
                sidemenu.active('leads');
                header.update('Lead Details', sidemenu.current().find('i')[0].outerHTML);
                loader.stop()

                fetchInnerLeadsData();

                // fetch inner leads data
                function fetchInnerLeadsData() {
                    fetch('action/fetchAllInnerLeads.php?id=' + id)
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            $('#fullName').val(data[0]['name']);
                            $('#email').val(data[0]['email']);
                            $('#mobile').val(data[0]['phone']);
                            $('#alt_phone').val(data[0]['alt_phone']);
                            $('#qualification').val(data[0]['qualification']);
                            $('#pincode').val(data[0]['phone']);
                            $('#address').val(data[0]['address']);

                            if (data[0]['readStatus'] == 1) {
                                $('#read_btn').css({
                                        background: 'rgb(11, 179, 11)',
                                    })
                                    .empty().append(`Lead Converted &nbsp; <i class="fas fa-thumbs-up"></i>`)
                                    .attr('data-done', 'true');
                            }
                            return data[0]['id'];
                        })
                        .then((id) => {
                            // read status update
                            $('#read_btn').click(e => {
                                e.preventDefault();
                                let status = 0;
                                const currentState = $(e.target).attr('data-done');
                                if (currentState == 'true') {
                                    status = 1;
                                    $('#read_btn').css({
                                            background: '#7A68FF',
                                        })
                                        .empty().append(`Mark as done &nbsp; <i class="fas fa-check"></i>`)
                                        .attr('data-done', 'false');
                                } else {
                                    $('#read_btn').css({
                                            background: 'rgb(11, 179, 11)',
                                        })
                                        .empty().append(`Lead Converted &nbsp; <i class="fas fa-thumbs-up"></i>`)
                                        .attr('data-done', 'true');
                                }
                                const readData = {
                                    id: id,
                                    status: status
                                }
                                fetch('action/markReadStatusUpdate.php', {
                                        method: 'post',
                                        headers: {
                                            contentType: 'application/json'
                                        },
                                        body: JSON.stringify(readData)
                                    })
                                    .then(response => response.text())
                                    .then(data => {
                                        if (currentState == 'false') {
                                            toaster.trigger({
                                                content: 'Marked as converted',
                                                type: 'success',
                                                timeout: 2000,
                                            });
                                        } else {
                                            toaster.trigger({
                                                content: 'Marked as default',
                                                type: 'success',
                                                timeout: 2000,
                                            })
                                        }
                                        barba.go('leads.html');

                                    })
                            })

                        })
                }
            }


        }, {
            namespace: 'admission_info',
            beforeEnter() {
                loader.load();
                sidemenu.active('admission');
                header.update('Admission Info', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                let admissionId = urlVal(window.location.href);

                admissionInnerData();

                function admissionInnerData() {
                    fetch('action/fetchAdmissionInnerData.php?id=' + admissionId)
                        .then(response => response.json())
                        .then(data => {
                            const {
                                studentName,
                                phone,
                                email,
                                alt_phone,
                                address,
                                aadhar,
                                certificate,
                                photo,
                                pincode,
                                qualification,
                                course_name,
                                course_amount,
                                payment_method,
                                instalment_id
                            } = data[0];
                            // user info variables
                            $('#fullName').val(studentName);
                            $('#email').val(email);
                            $('#mobile').val(phone);
                            $('#alt_phone').val(alt_phone);
                            $('#qualification').val(qualification);
                            $('#pincode').val(pincode);
                            $('#address').val(address);

                            // user docs ***
                            $('#certificate').find('a').attr('href', 'upload_image/student_documents/' + certificate);
                            $('#aadhaar').find('a').attr('href', 'upload_image/student_documents/' + aadhar);
                            $('#photo').find('a').attr('href', 'upload_image/student_documents/' + photo);
                            // course info ***
                            $('#course_name p').text(course_name);
                            $('#course_amount p span').text(course_amount);
                            // installments ***

                            // payment
                            $('#payment-type p').text(payment_method == 'direct' ? 'Full Payment' : 'Installment');
                            $('#paid-amount p span').text(payment_method == 'direct' ? course_amount : '')

                            return {
                                method: payment_method,
                                id: instalment_id
                            };
                        })
                        .then(props => {
                            const {
                                method,
                                id
                            } = props || {};

                            if (method == 'instalment') {

                                // prevent past date on due input
                                var dtToday = new Date();
                                var month = dtToday.getMonth() + 1;
                                var day = dtToday.getDate();
                                var year = dtToday.getFullYear();
                                if (month < 10)
                                    month = '0' + month.toString();
                                if (day < 10)
                                    day = '0' + day.toString();
                                var maxDate = year + '-' + month + '-' + day;
                                $('.due-input').attr('min', maxDate);



                                fetch('action/fetchInstalmentAdmissionInner.php?id=' + admissionId)
                                    .then(response => response.json())
                                    .then(data => {
                                        data && data.map(x => {
                                            const {
                                                instalmentId,
                                                instalmentAmount
                                            } = x;
                                            let template = ` <div data-installment-id="${instalmentId}" class="box ${instalmentId == id ? 'active' : ''}"><i class="fas fa-rupee-sign"></i> ${instalmentAmount}</div>`;
                                            $('.installment-holder ul li').append(template);
                                            if (instalmentId == id) $('#paid-amount p span').text(instalmentAmount);
                                        });
                                        $('.installment-holder').show();
                                    })
                            } else {
                                $('.due-date-picker').remove();
                            }
                        }).then(() => {
                            // UPADTE GOES HERE


                            // info update
                            $('#inner_leads_form').submit(e => {
                                e.preventDefault();

                                const name = $('#fullName').val();
                                const email = $('#email').val();
                                const mobile = $('#mobile').val();
                                const alt_mobile = $('#alt_phone').val();
                                const qualification = $('#qualification').val();
                                const pincode = $('#pincode').val();
                                const address = $('#address').val();

                                let button = new Button($('#update_info_btn')[0]);

                                button.load('Updating...');

                                fetch('action/updateAdmissionInfo.php', {
                                        method: 'POST',
                                        headers: {
                                            contentType: 'application/json'
                                        },
                                        body: JSON.stringify({
                                            admissionId: admissionId,
                                            name: name,
                                            email: email,
                                            mobile: mobile,
                                            alt_mobile: alt_mobile,
                                            qualification: qualification,
                                            pincode: pincode,
                                            address: address
                                        })
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data == 1) {
                                            button.stop();
                                            toaster.trigger({
                                                content: 'Info Updated Successfully',
                                                timeout: 2000,
                                                type: 'success',
                                            })
                                        } else {
                                            button.stop();
                                            toaster.trigger({
                                                content: 'Something Went Wrong',
                                                timeout: 2000,
                                                type: 'error',
                                            })
                                        }
                                    })
                            })


                            // doc update
                            $('.upload').click(function () {
                                const updateType = $(this).attr('data-update-type');
                                const input = $(this).parent().find('input');
                                input.blur(function () {
                                    setDocs();
                                })
                                input[0].click();

                                input.unbind().on('change', function () {
                                    console.log(input.val())
                                    if (updateType == 'photo') {
                                        if (checkFileSize(input[0])) {
                                            toaster.trigger({
                                                content: 'Please wait uploading docs',
                                                type: 'upload',
                                                timeout: ''
                                            })
                                            updateDocs(input[0].files[0], updateType).then(x => {
                                                if (x == true) {
                                                    toaster.kill();
                                                    toaster.trigger({
                                                        content: 'Document Updated',
                                                        type: 'success',
                                                        timeout: 2000,
                                                    })
                                                } else {
                                                    toaster.kill();
                                                    toaster.trigger({
                                                        content: 'Something went wrong',
                                                        type: 'error',
                                                        timeout: 2000,
                                                    })
                                                }
                                            });
                                        } else {
                                            toaster.trigger({
                                                content: 'Maximum fize size : 400kb',
                                                timeout: 2000,
                                                type: 'error'
                                            })
                                        }
                                    } else {

                                        toaster.trigger({
                                            content: 'Please wait uploading docs',
                                            type: 'upload',
                                            timeout: ''
                                        })

                                        updateDocs(input[0].files[0], updateType).then(x => {
                                            toaster.kill();
                                            if (x == true) {
                                                toaster.trigger({
                                                    content: 'Document Updated',
                                                    type: 'success',
                                                    timeout: 2000,
                                                })
                                            } else {
                                                toaster.trigger({
                                                    content: 'Something went wrong',
                                                    type: 'error',
                                                    timeout: 2000,
                                                })
                                            }
                                        });
                                    }
                                })

                            })
                            async function updateDocs(file, type) {
                                const fd = new FormData();
                                fd.append('file', file);
                                fd.append('updateType', type);
                                fd.append('admissionId', admissionId);
                                return fetch('action/updateAdmissionDocs.php', {
                                        method: 'post',
                                        body: fd,
                                    })
                                    .then(response => response.text())
                                    .then(data => {
                                        console.log(data)
                                        if (data == 1) {
                                            setDocs();
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    })
                            }

                            async function setDocs() {
                                await fetch('action/fetchAdmissionInnerData.php?id=' + admissionId)
                                    .then(response => response.json())
                                    .then(data => {
                                        const {
                                            aadhar,
                                            certificate,
                                            photo,
                                        } = data[0];
                                        // user docs ***
                                        $('#certificate').find('a').attr('href', 'upload_image/student_documents/' + certificate);
                                        $('#aadhaar').find('a').attr('href', 'upload_image/student_documents/' + aadhar);
                                        $('#photo').find('a').attr('href', 'upload_image/student_documents/' + photo);
                                    })
                            }



                        })
                }


                // **** approve student ****
                $('#approve_form').submit(e => {
                    e.preventDefault();
                    let validationErrorCount = 0;
                    $('#inner_leads_form input, textarea').each(function () {

                        let x = $(this);
                        if (x.val() == "") {
                            x.css({
                                border: '1px solid red',
                            });
                            validationErrorCount++;
                        }
                    })

                    $('#inner_leads_form')[0].scrollIntoView();


                    if (validationErrorCount != 0)
                        return;

                    let button = new Button($('#approve_student')[0]);
                    button.load('Approving...');

                    const courseAmount = $.trim(parseInt($('#course_amount p span').text()));
                    const paidAmount = $.trim(parseInt($('#paid-amount p span').text()));
                    let nextDueDate = 0;

                    if ($('.due').val() != '') {
                        nextDueDate = $('.due').val();
                    }

                    fetch('action/approveStudent.php?id=' + admissionId, {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                courseAmount,
                                paidAmount,
                                nextDueDate
                            })
                        })
                        .then(response => response.text())
                        .then(data => {
                            console.log(data)
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'Approved Successfully',
                                    type: 'success',
                                    timeout: 2000,
                                });
                                history.back();
                            } else {
                                button.stop();
                                toaster.trigger({
                                    content: 'Someting Went Wrong!',
                                    type: 'error',
                                    timeout: 2000,
                                });
                            }
                        })
                });

                $('#declined').click(e => {
                    let button = new Button(e.target);
                    button.load('Declining...');

                    fetch('action/declindStudent.php?id=' + admissionId)
                        .then(response => response.text())
                        .then(data => {
                            console.log(data)
                            if (data == 1) {
                                button.stop();
                                toaster.trigger({
                                    content: 'Declind Successfully',
                                    type: 'success',
                                    timeout: 2000,
                                });
                                history.back();
                            } else {
                                button.stop();
                                toaster.trigger({
                                    content: 'Someting Went Wrong!',
                                    type: 'error',
                                    timeout: 2000,
                                });
                            }
                        })
                });
            }
        }, {
            namespace: 'newadmission',
            beforeEnter() {
                let slno = 0;
                loader.load();
                sidemenu.active('admission');
                header.update('New Admissions', sidemenu.current().find('i')[0].outerHTML);


                fetchNewAdmission();

                function fetchNewAdmission() {
                    fetch('action/fetchAllNewAdmission.php')
                        .then(response => response.json())
                        .then(data => {
                            if (data.length) {
                                loader.stop();
                                data.map(row => {
                                    slno++;
                                    const {
                                        id,
                                        name,
                                        email,
                                        course
                                    } = row;
                                    const rowContent = [slno, name, email, course];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'admission-info.html?id=' + id,

                                    });
                                })
                            } else {
                                table.empty();
                                loader.stop();
                            }

                        })
                }
                let table = new Table('#newadmission_table');

            }
        }, {
            namespace: 'admission',
            beforeEnter() {

                loader.load();
                sidemenu.active('admission');
                header.update('Admissions', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                // fetch admission count
                fetch('action/fetchAdmissionCount.php')
                    .then(response => response.json())
                    .then(data => {
                        $('#new_admission_count').append(data[0]['count']);
                    })

                // fetch Reject count
                fetch('action/fetchRejectCount.php')
                    .then(response => response.json())
                    .then(data => {
                        $('#rejection_count').append(data[0]['count']);
                    })

                // tab
                const button = $('.tab a');
                button.click(e => {
                    e.preventDefault();
                    const ref = $(e.target).attr('data-for');
                    const tabs = $('.view');
                    button.removeClass('active-tab');
                    $(e.target).addClass('active-tab');
                    tabs.each(function () {
                        const tabref = $($(this)).attr('data-for');
                        if (ref == tabref) {
                            const targetTab = $(this);
                            tabs.hide();
                            targetTab.show();
                            getData(targetTab);
                        }
                    });
                });

                function getData(tab) {
                    console.log(tab)
                    let loader = new Loader(tab);
                    loader.load();
                    loader.stop();
                }
            }
        }, {
            namespace: 'accounts',
            beforeEnter() {

                loader.load();
                sidemenu.active('accounts');
                header.update('Accounts', sidemenu.current().find('i')[0].outerHTML);


                // fetch all payments total
                fetch('action/fetchAllPaymentsTotal.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {
                            const {
                                totalPayment,
                                newPayment,
                                totalPendingDue,
                                closedPaymetCount,
                                totalDue
                            } = data[0];

                            $('#total_payments').append(addSeperation(totalPayment));
                            $('#new_payments').append(addSeperation(newPayment));
                            $('#pending_due_amount').append(addSeperation(totalPendingDue));
                            $('#closed_payment_count').append(closedPaymetCount);
                            $('#all_due').append(addSeperation(totalDue));
                        }
                        loader.stop();
                    })


            }
        }, {
            namespace: 'payments',
            beforeEnter() {
                let slno = 0;
                loader.load();
                sidemenu.active('accounts');
                header.update('Payments', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();
                let table = new Table($('#payments_tbl')[0])
                const data = [{
                    id: 1,
                    name: 'kannan',
                    course: 'bca ug course',
                    amount: 5000,

                }]

                newPayments();

                // fetch all new payments
                function newPayments() {
                    fetch('action/fetchAllNewPayments.php')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if (data.length) {
                                loader.stop();

                                data.map(row => {
                                    slno++;
                                    const {
                                        courseId,
                                        studentId,
                                        name,
                                        course,
                                        amount
                                    } = row;
                                    const rowContent = [slno, name, course, `<span style="color : green; font-size : 20px; font-weight : 500;"><i class="fas fa-rupee-sign"></i> &nbsp; ${amount}</span>`];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'student-info.html?id=' + studentId + '&cid=' + courseId + '&trigger',

                                    });
                                })
                            } else {
                                table.empty();
                                loader.stop();
                            }
                        })
                }




            }
        }, {
            namespace: 'all_payments',
            beforeEnter() {
                let slno = 0;
                let startLimit = 0;
                let endLimit = 10;
                // fitler status
                let filterStatus = 0;
                let searchVal = '';
                // filter value
                let dateFilter = null;

                loader.load();
                sidemenu.active('accounts');
                header.update('All Payments', sidemenu.current().find('i')[0].outerHTML);

                let table = new Table($('#all_payments_tbl')[0])
                loader.stop();

                $('#searchData').keyup(function () {
                    searchVal = $(this).val();
                    splitPage(10);
                })

                // filter date
                $('#dateFilter').change(e => {
                    filterStatus = 1;
                    dateFilter = $(e.target).val();
                    splitPage(10);
                })

                $(function () {
                    var dtToday = new Date();

                    var month = dtToday.getMonth() + 1;
                    var day = dtToday.getDate();
                    var year = dtToday.getFullYear();

                    if (month < 10)
                        month = '0' + month.toString();
                    if (day < 10)
                        day = '0' + day.toString();

                    var maxDate = year + '-' + month + '-' + day;
                    $('#dateFilter').attr('max', maxDate);
                });


                // clear filter
                $('#clear_filter').click(function () {
                    filterStatus = 0;
                    dateFilter = null;
                    $('#dateFilter').val('');
                    splitPage(10);
                })


                function allPaymentData(limit) {
                    table.clear();
                    table.loader().progress();
                    fetch('action/fetchAllPaymentData.php?limit=' + limit, {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                filterStatus: filterStatus,
                                dateFilter: dateFilter,
                                searchVal: searchVal
                            })
                        })
                        .then(response => response.json())
                        .then(data => {

                            loader.stop();
                            console.log(data)
                            if (data.length) {
                                data.map(row => {
                                    slno++;
                                    const {
                                        amount,
                                        student_id,
                                        studentName,
                                        courseName,
                                        date,
                                        time
                                    } = row;
                                    const rowContent = [slno, studentName, courseName, '<i class="fas fa-rupee-sign"></i> &nbsp; ' + amount, date, time];
                                    table.addRow(rowContent);
                                    table.actions({
                                        view: 'student-info.html?id=' + student_id,
                                    });
                                })
                                table.loader().stop();
                            } else {
                                table.empty();
                            }
                        })
                }

                let init = false;

                function splitPage(splitLimit) {

                    fetch('action/splitPageAllPayments.php?limit=' + splitLimit, {
                            method: 'post',
                            headers: {
                                contentType: 'application/json'
                            },
                            body: JSON.stringify({
                                filterStatus: filterStatus,
                                dateFilter: dateFilter,
                                searchVal: searchVal
                            })
                        })
                        .then(response => response.json())
                        .then(pdata => {
                            console.log(pdata[0]['length'])
                            if (pdata[0]['length'] != '') {
                                let pageSplitLen = pdata[0]['length']
                                if (pageSplitLen == 1) {
                                    slno = 0;
                                    startLimit = 0;
                                    $('.pagination-sm').hide();
                                    allPaymentData(startLimit + ',' + endLimit, filterStatus)
                                } else {
                                    $('.pagination-sm').show();
                                    $.getScript('../src/plugin/pagination.js', function () {
                                        $('#pagination-demo').twbsPagination('destroy')
                                        $('#pagination-demo').twbsPagination({
                                            totalPages: pageSplitLen,
                                            visiblePages: endLimit,
                                            onPageClick: function (event, page) {
                                                if (page == 1) {
                                                    slno = 0;
                                                    startLimit = 0;
                                                } else {
                                                    let multiple = page - 1
                                                    startLimit = endLimit * multiple
                                                }
                                                slno = startLimit;
                                                allPaymentData(startLimit + ',' + endLimit)
                                            }
                                        });
                                    })
                                }
                            } else {
                                $('.pagination-sm').hide();
                                table.empty();
                            }
                        })
                }

                //global. calling
                splitPage(10);


                // fetch total payments and due
                fetch('action/totalPaymentAmountAndDueData.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.length) {
                            $('#totalAmount').text(data[0]['totalAmount']);
                            $('#dueAmount').text(data[0]['totalDue']);
                        }
                    })

            }
        }, {
            namespace: 'due',
            beforeEnter() {
                let slno = 0;
                loader.load();
                sidemenu.active('accounts');
                header.update('Pending Due', sidemenu.current().find('i')[0].outerHTML);

                let table = new Table($('#due_tbl')[0])

                paymentDue();

                // fetch all new payments
                function paymentDue() {
                    fetch('action/fetchAllPaymentsDue.php')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if (data.length) {
                                loader.stop();
                                console.log(data)
                                data.map(row => {
                                    slno++;
                                    const {
                                        courseId,
                                        studentId,
                                        name,
                                        course,
                                        dueAmount,
                                        dueDate
                                    } = row;
                                    const rowContent = [slno, name, course, `<span style="color : red; font-size : 20px; font-weight : 500;">${dueAmount}</span>`, dueDate];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'student-info.html?id=' + studentId + '&cid=' + courseId + '&trigger',

                                    });
                                })

                            } else {
                                table.empty();
                                loader.stop();
                            }
                        })
                }

            }
        }, {
            namespace: 'closed_payment',
            beforeEnter() {

                let slno = 0;
                loader.load();
                sidemenu.active('accounts');
                header.update('Closed Payments', sidemenu.current().find('i')[0].outerHTML);

                let table = new Table($('#payments_tbl')[0]);

                closedPayments();

                // fetch all new payments
                function closedPayments() {
                    fetch('action/fetchAllClosedPayments.php')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if (data.length) {
                                loader.stop();
                                console.log(data)
                                data.map(row => {
                                    slno++;
                                    const {
                                        studentId,
                                        name,
                                        course,
                                    } = row;
                                    const rowContent = [slno, name, course];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'student-info.html?id=' + studentId,

                                    });
                                })

                            } else {
                                table.empty();
                                loader.stop();
                            }
                        })
                }
            }
        }, {
            namespace: 'all_due',
            beforeEnter() {

                let slno = 0;
                loader.load();
                sidemenu.active('accounts');
                header.update('All Due', sidemenu.current().find('i')[0].outerHTML);

                let table = new Table($('#all_due_tbl')[0]);


                allPaymentDue();

                // fetch all new payments
                function allPaymentDue() {

                    fetch('action/AllPaymentsDue.php')
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if (data.length) {
                                loader.stop();
                                console.log(data)
                                data.map(row => {
                                    slno++;
                                    const {
                                        studentId,
                                        name,
                                        course,
                                        amount
                                    } = row;
                                    const rowContent = [slno, name, course, amount];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'student-info.html?id=' + studentId,

                                    });
                                })

                            } else {
                                table.empty();
                                loader.stop();
                            }
                        })
                }

            }
        }, {
            namespace: 'declined_admission',
            beforeEnter() {
                let slno = 0;
                loader.load();
                sidemenu.active('admission');
                header.update('Rejected Admissions', sidemenu.current().find('i')[0].outerHTML);
                loader.stop();

                fetchRejectedAdmission();

                function fetchRejectedAdmission() {
                    fetch('action/fetchAllRejectedAdmission.php')
                        .then(response => response.json())
                        .then(data => {
                            if (data.length) {
                                loader.stop();
                                data.map(row => {
                                    slno++;
                                    const {
                                        id,
                                        name,
                                        email,
                                        course
                                    } = row;
                                    const rowContent = [slno, name, email, course];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'admission-info.html?id=' + id,

                                    });
                                })
                            } else {
                                table.empty();
                                loader.stop();
                            }

                        })
                }
                let table = new Table('#declined_admission');
            }
        }, {
            namespace: 'list_student',
            beforeEnter() {
                let slno = 0;
                let startLimit = 0;
                let endLimit = 10;
                let searchData = '';

                $('#search_filter').keyup(function () {
                    searchData = $(this).val();
                    splitPage(10);
                })

                loader.load();
                sidemenu.active('students');
                header.update('Students', sidemenu.current().find('i')[0].outerHTML);

                let table = new Table('#student_list_table');

                function fetchAllStudents(limit) {
                    table.clear();
                    slno = startLimit;
                    fetch('action/fetchAllStudents.php?limit=' + limit + '&searchData=' + searchData)
                        .then(response => response.json())
                        .then(data => {
                            // console.log(data)
                            loader.stop();
                            if (data.length) {
                                loader.stop();
                                data.map(row => {
                                    slno++;
                                    const {
                                        id,
                                        name,
                                        email,
                                    } = row;
                                    const rowContent = [slno, name, email];
                                    table.addRow(rowContent);
                                    table.actions({

                                        view: 'student-info.html?id=' + id,

                                    });
                                })
                            } else {
                                table.empty();
                                loader.stop();
                            }

                        })
                }

                function splitPage(splitLimit) {

                    fetch('action/splitPageStudents.php?limit=' + splitLimit + '&searchData=' + searchData)
                        .then(response => response.json())
                        .then(pdata => {

                            if (pdata[0]['length'] != '') {
                                let pageSplitLen = pdata[0]['length']
                                if (pageSplitLen == 1) {
                                    startLimit = 0;
                                    fetchAllStudents(startLimit + ',' + endLimit)
                                }

                                $.getScript('../src/plugin/pagination.js', function () {
                                    $('#pagination-demo').twbsPagination({
                                        totalPages: pageSplitLen,
                                        visiblePages: endLimit,
                                        onPageClick: function (event, page) {
                                            if (page == 1) {
                                                slno = 0;
                                                startLimit = 0;
                                            } else {
                                                let multiple = page - 1
                                                startLimit = endLimit * multiple
                                            }
                                            slno = startLimit;
                                            fetchAllStudents(startLimit + ',' + endLimit)
                                        }
                                    });
                                })


                            } else {

                            }
                        })
                }

                splitPage(10);

            }
        }, {
            namespace: 'student_inner',
            beforeEnter() {
                loader.load();
                sidemenu.active('students');
                header.update('Students', sidemenu.current().find('i')[0].outerHTML);
                let studentId = null;
                let courseId = null;
                const studentIdUrl = window.location.href;
                const willTrigger = studentIdUrl.split('&')[2];
                if (willTrigger == 'trigger') {
                    $('#course-tab-button').click();
                    studentId = studentIdUrl.split('&')[0].split('=')[1];
                    courseId = location.href.split('&')[1].split('=')[1];
                } else {
                    studentId = studentIdUrl.split('=')[1];
                }

                const studentBasicDetails = new Promise((resolve, reject) => {
                    fetch('action/fetchStudentBasicDetails.php?id=' + studentId)
                        .then(response => response.json())
                        .then(data => resolve(data));
                });

                const studentCourseDetails = new Promise((resolve, reject) => {
                    fetch('action/fetchCourseDetails.php?id=' + studentId)
                        .then(response => response.json())
                        .then(data => resolve(data));
                });

                const studentPaymentHistory = new Promise((resolve, reject) => {
                    fetch('action/fetchStudentPaymentDetails.php?id=' + studentId)
                        .then(response => response.json())
                        .then(data => resolve(data));
                });

                const paymetDue = new Promise((resolve, reject) => {
                    fetch('action/fetchPaymentDue.php?id=' + studentId)
                        .then(response => response.json())
                        .then(data => resolve(data));
                });

                Promise.all([studentBasicDetails, studentCourseDetails, studentPaymentHistory, paymetDue]).then(data => {
                    loader.stop();

                    const {
                        name,
                        phone,
                        email,
                        alt_phone,
                        pincode,
                        added_date,
                        address,
                        qualification
                    } = data[0][0];
                    // user profile insertion
                    $('#student_name').text(name);
                    $('#student_join_date').text(added_date);
                    $('#student_phone').text(phone);
                    // user info variables
                    $('#fullName').val(name);
                    $('#email').val(email);
                    $('#mobile').val(phone);
                    $('#alt_phone').val(alt_phone);
                    $('#qualification').val(qualification);
                    $('#pincode').val(pincode);
                    $('#address').val(address);


                    data[1].map(x => {
                        const {
                            courseId,
                            courseName,
                            courseFee,
                            university,
                            sessionInfo,
                            courseStatus,
                            dueDate,
                            dueAmount
                        } = x || {};

                        let template = `
                        <div class="card" data-course-id="${courseId}">
                            <p class="course-name">${courseName}</p>
                            <p class="university-name infos">${university}</p>
                            <p class="course-fee infos"> Course Fee : <span style="font-size : 18px;"> &nbsp; ${courseFee}</span></p>
                            <p class="course-fee infos"> Course Due : <span style="font-size : 18px;"> &nbsp; ${dueAmount}</span></p>

                            <div class="session_list">
                            <ul>`
                        sessionInfo && sessionInfo.map(l => {

                            const {
                                session_id,
                                session_name,
                                visible_status,
                            } = l;

                            template += `<li>
                                                <div class="session-title">${session_name}</div>
                                                <button data-course-id=${courseId} data-session-id="${session_id}" class="session_status_btn ${visible_status == 1  ? 're-activate' : ''}" data-current-status="${visible_status ==1 ? 'true' : 'false'}">${visible_status == 1 ? 'Disable' : 'Activate'}</button>
                                              </li>`
                        })

                        template += `</ul>
                            </div>
                            <br/>
                            <div class="course_options">
                                <div class="option-box block-course" data-current-status="${courseStatus == 2 ? 'true' : 'false'}" style="${courseStatus == 2 ? 'background : orange;' : 'red'}" data-course-id="${courseId}">

                                    <p>${courseStatus == 2 ? 'Unblock Course' : 'Block Course'}</p>
                                </div>




                            </div>`;

                        if (dueAmount != 0) {
                            template += `<div class="form-group">
                                    <label>Set next due date</label>
                                    <input type="date" min="${dueDate}" value="${dueDate}" class="setDueDate" />
                                    <div class="hint" style="display : none; width : 100%; margin-top : 5px; font-weight : bold;"><i class="fas fa-history"></i> &nbsp;Set New Due Date</div>
                                </div>`;
                        }
                        template += `</div>`;
                        $('.cards-holder').append(template);

                    })

                    // highlight card when comes from payement
                    if (courseId) {
                        $('.card').each(function () {
                            const id = $(this).attr('data-course-id');
                            console.log(id)
                            if (id == courseId) {

                                $(this)[0].scrollIntoView();
                                $(this).css({
                                    background: '#ddffdd',
                                    transition: '0.5s',
                                })
                                $(this).find('.hint').show();
                                $(this).find('input').css({
                                    border: '1px solid red'
                                })


                            } else {
                                $(this).css({
                                    pointerEvents: 'none',
                                    cursor: 'not-allowed',
                                    opacity: 0.5
                                })
                            }
                        })
                    }

                    $('.session_status_btn').off('click').click(function (e) {
                        e.preventDefault();
                        const courseId = $(this).attr('data-course-id'),
                            sessionId = $(this).attr('data-session-id'),
                            currentStatus = $(this).attr('data-current-status'),
                            button = $(this);

                        if (currentStatus == 'true') {

                            $(this).css({
                                background: '#eee',
                                color: 'black',
                            }).text('Activate')
                            // success
                            $(this).attr('data-current-status', false);
                        } else {

                            $(this).css({
                                background: 'orange',
                                color: 'black',
                            }).text('Disable')
                            //success
                            $(this).attr('data-current-status', true);
                        }

                        fetch('action/unloackStudentCourse.php', {
                                method: 'post',
                                headers: {
                                    contentType: 'application/json'
                                },
                                body: JSON.stringify({
                                    courseId: courseId,
                                    sessionId: sessionId,
                                    currentStatus: currentStatus,
                                    studentId: studentId
                                })
                            })
                            .then(response => response.text())
                            .then(data => {
                                console.log(data)
                            });

                    })


                    //block
                    $('.block-course').click(function () {

                        const status = $(this).attr('data-current-status');
                        const courseId = $(this).attr('data-course-id');
                        if (status == 'false') {

                            $(this).css({
                                background: 'orange',
                                color: 'white'
                            }).text('Unblock Course');
                            $(this).attr('data-current-status', 'true');
                            toaster.trigger({
                                content: 'Blocked the course',
                                type: 'success',
                                timeout: 2000,
                            })
                        } else {
                            $(this).css({
                                background: 'red',
                                color: 'white'
                            }).text('Block Course');
                            $(this).attr('data-current-status', 'false');
                            toaster.trigger({
                                content: 'Unblocked the course',
                                type: 'success',
                                timeout: 2000,
                            })
                        }

                        fetch('action/blockCourseStudent.php', {
                                method: 'post',
                                headers: {
                                    contentType: 'application/json'
                                },
                                body: JSON.stringify({
                                    courseId: courseId,
                                    status: status,
                                    studentId: studentId
                                })
                            })
                            .then(response => response.text())
                            .then(data => {
                                console.log(data)
                            })
                    })


                    $('.setDueDate').on('change', function () {

                        const cardCourseId = $(this).closest('.card').attr('data-course-id');
                        const dueDate = $(this).val();
                        fetch('action/updateFollowUp.php', {
                                method: 'post',
                                headers: {
                                    contentType: 'application/json'
                                },
                                body: JSON.stringify({
                                    courseId: courseId == null ? cardCourseId : courseId,
                                    studentId: studentId,
                                    dueDate: dueDate,

                                })
                            })
                            .then(response => response.text())
                            .then(data => {
                                console.log(data)
                                if (data == 1) {
                                    toaster.trigger({
                                        content: 'New due date added',
                                        timeout: 2000,
                                        type: 'success'
                                    });
                                    setTimeout(() => {
                                        history.back();
                                    }, 2000);
                                }
                            })
                    })



                    let sln = 0;
                    data[2].map(m => {

                        sln++;
                        const {
                            amount,
                            courseName,
                            date,
                            time
                        } = m;

                        $('#Lesson_table tbody').append(`
                            <tr>
                                <th>${sln}</th>
                                <th>${courseName}</th>
                                <th><i class="fas fa-rupee-sign"></i> &nbsp; ${amount}</th>
                                <th>${date}</th>
                                <th>${time}</th>
                            </tr>
                        `);
                    })

                    const {
                        due_amount
                    } = data[3][0];

                    $('#paymentDue').text(due_amount + '/-');
                });


                const button = $('.tab a');
                button.click(e => {
                    e.preventDefault();
                    const ref = $(e.target).attr('data-for');
                    const tabs = $('.view');
                    button.removeClass('active-tab');
                    $(e.target).addClass('active-tab');
                    tabs.each(function () {
                        const tabref = $($(this)).attr('data-for');
                        if (ref == tabref) {
                            const targetTab = $(this);
                            tabs.hide();
                            targetTab.show();
                            // getData(targetTab);
                        }
                    });
                });


                if (willTrigger == 'trigger') {
                    $('#course-tab-button').click();
                }


            }
        }
    ]
})

function urlVal(urlData) {
    const url = urlData;
    const splitUrl = url.split('=');
    const urlId = splitUrl[1];
    return urlId;
}


function checkFileSize(elem) {
    let status = null;
    if (elem.files[0].size > 200000) {
        $(elem).val('');
        toaster.trigger({
            type: 'error',
            content: 'Maximum file size 200 KB',
            timeout: 2000,
        })
        status = false;
    } else {
        status = true;
    }
    return status;
}



function getJsonFromUrl(url) {
    if (!url) url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

function addSeperation(amound) {
    let disAmound = amound;
    let x1 = disAmound;
    x1 = x1.toString();
    let lastThree1 = x1.substring(x1.length - 3);
    let otherNumbers1 = x1.substring(0, x1.length - 3);
    if (otherNumbers1 != '')
        lastThree1 = ',' + lastThree1;
    let res1 = otherNumbers1.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree1;
    return res1
}