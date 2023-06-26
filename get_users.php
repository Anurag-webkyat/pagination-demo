<?php
require './_class/dbConfig.php';
$obj  = new dbConfig();
$conn = $obj->getConnection();

// fetch total count
$query_count = "SELECT count(*) as total_count FROM faq_activity";
$stmt_count  = $conn->prepare($query_count);
$stmt_count->execute();
$result_count = $stmt_count->get_result();
$total_count  = $result_count->fetch_assoc()['total_count'];

$page         = $_GET['page'];
$itemsPerPage = $_GET['perPage'];

// Calculate the necessary pagination parameters
$totalPages = ceil($total_count / $itemsPerPage);
$startCount = $_GET['startCount'];

// Query to retrieve user data
$query = "SELECT * FROM faq_activity LIMIT $startCount, $itemsPerPage";
$stmt  = $conn->prepare($query);
$stmt->execute();
$data = [];

// Fetch all user records as an associative array
$result = $stmt->get_result();
while ($data_row = $result->fetch_assoc()) {
    $data[] = $data_row;
}

// Prepare the response as JSON
$response = [
    'data'        => $data,
    'totalPages'  => $totalPages,
    'currentPage' => $page,
];

// Return user data as JSON
echo json_encode($response);
