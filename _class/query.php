<?php
include_once 'dbConfig.php';
class query
{
    public $con;
    public function __construct()
    {
        $obj       = new dbConfig();
        $this->con = $obj->getConnection();
    }
    public function selectData($field, $table, $where)
    {
        $sql = "select $field from $table $where";
        return mysqli_query($this->con, $sql);
    }
    public function selectData1($field, $table, $where)
    {
        $sql = "select $field from $table $where";
        return $sql;
    }
    public function insertData($table, $infolog)
    {
        $stmkey = "";
        foreach ($infolog as $key => $infolog1) {
            if ($stmkey == "") {
                $stmkey = $stmkey . $key;
            } else {
                $stmkey = $stmkey . "," . $key;
            }
        }
        $stmt1 = "insert into $table ($stmkey) values(";
        $stmt2 = "";
        $stmt3 = ")";
        foreach ($infolog as $key => $infolog1) {
            if ($stmt2 == "") {
                $stmt2 = $stmt2 . "'" . mysqli_real_escape_string($this->con, $infolog1) . "'";
            } else {
                $stmt2 = $stmt2 . ",'" . mysqli_real_escape_string($this->con, $infolog1) . "'";
            }
        }
        $finalq = $stmt1 . $stmt2 . $stmt3;
        return mysqli_query($this->con, $finalq);
    }
    public function insertData1($table, $infolog)
    {
        $stmkey = "";
        foreach ($infolog as $key => $infolog1) {
            if ($stmkey == "") {
                $stmkey = $stmkey . $key;
            } else {
                $stmkey = $stmkey . "," . $key;
            }
        }
        $stmt1 = "insert into $table ($stmkey) values(";
        $stmt2 = "";
        $stmt3 = ")";
        foreach ($infolog as $key => $infolog1) {
            if ($stmt2 == "") {
                $stmt2 = $stmt2 . "'" . mysqli_real_escape_string($this->con, $infolog1) . "'";
            } else {
                $stmt2 = $stmt2 . ",'" . mysqli_real_escape_string($this->con, $infolog1) . "'";
            }
        }
        $finalq = $stmt1 . $stmt2 . $stmt3;
        return $finalq;
    }
    public function updateData($table, $info, $where)
    {
        $stmt = "";
        foreach ($info as $key1 => $data1) {
            if ($stmt == "") {
                $stmt = $stmt . $key1 . "='" . mysqli_real_escape_string($this->con, $data1) . "'";
            } else {
                $stmt = $stmt . "," . $key1 . "='" . mysqli_real_escape_string($this->con, $data1) . "'";
            }
        }
        $stmt1 = "update $table set $stmt $where";
        return mysqli_query($this->con, $stmt1);
    }
    public function updateData1($table, $info, $where)
    {
        $stmt = "";
        foreach ($info as $key1 => $data1) {
            if ($stmt == "") {
                $stmt = $stmt . $key1 . "='" . mysqli_real_escape_string($this->con, $data1) . "'";
            } else {
                $stmt = $stmt . "," . $key1 . "='" . mysqli_real_escape_string($this->con, $data1) . "'";
            }
        }
        $stmt1 = "update $table set $stmt $where";
        return $stmt1;
    }
}
