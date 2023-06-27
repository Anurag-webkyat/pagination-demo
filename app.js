
$(document).ready(function () {
    function fetchData(page, itemsPerPage,) {
        $('#userTable tbody').empty();
        const startCount = (page - 1) * itemsPerPage + 1;
        axios.get('get_users.php?page=' + page + '&perPage=' + itemsPerPage + '&startCount=' + startCount)
            .then(function (response) {
                console.log(response.data);
                const data = response.data.data;
                data.map((x, i) => {
                    const { id, answer, question } = x;
                    let slno = startCount + i;
                    $('#userTable tbody').append(`
                        <tr>
                            <td>${slno}</td>
                            <td>${question}</td>
                            <td>${answer}</td>
                        </tr>
                    `);
                });

                // Initialize the Twbs Pagination component
                $('#pagination').twbsPagination({
                    totalPages: response.data.totalPages,
                    visiblePages: 5,
                    initiateStartPageClick: false,
                    onPageClick: function (event, page) {
                        // Fetch the data for the selected page
                        fetchData(page, 10);
                    }
                });
            })
            .catch(function (error) {
                console.error(error);
            });
    }
    fetchData(1, 10);
});
