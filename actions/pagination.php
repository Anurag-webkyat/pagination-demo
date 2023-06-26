<?php
require '../_class/dbConfig.php';
$obj        = new dbConfig();
$conn       = $obj->getConnection();
$data_array = [];

/* ------------------------------ current page ------------------------------ */
$current_page = $_POST['currentPage'];

/* ---------------------------- page start limit ---------------------------- */
$startLimit = $_POST['startLimit'];

/* ------------------------------ row per page ------------------------------ */
$pageLimit = $_POST['rowPerPage'];
$offset    = ($current_page - 1) * $pageLimit;

/* ----------------- fetch some activity data form database ----------------- */
$sql = $conn->prepare("SELECT * FROM faq_activity LIMIT ?, ?");
$sql->bind_param('ii', $offset, $pageLimit);
$sql->execute();
$result = $sql->get_result();
if ($result->num_rows > 0) {
    while ($data_row = $result->fetch_assoc()) {
        $data_array[] = [
            'id'       => $data_row['id'],
            'question' => $data_row['question'],
            'answer'   => $data_row['answer'],
        ];
    }
}

/* ------------------- Calculate the total number of items ------------------ */
$sql_count = $conn->prepare("SELECT COUNT(*) AS total FROM faq_activity");
$sql_count->execute();
$count_row   = $sql->get_result();
$total_count = $count_row->fetch_assoc()['total'];

// Calculate the total number of pages
$totalPages = ceil($total_count / $pageLimit);

echo json_encode([
    'data'       => $data_array,
    'totalPages' => $totalPages,
]);
