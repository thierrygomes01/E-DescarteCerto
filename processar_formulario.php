<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST["name"]) && isset($_POST["endereco"]) && isset($_POST["cidade"]) && 
        isset($_POST["estado"]) && isset($_POST["telefone"]) && isset($_POST["cep"]) && isset($_POST["mensagem"])) {

        $nome = $_POST["name"];
        $endereco = $_POST["endereco"];
        $cidade = $_POST["cidade"];
        $estado = $_POST["estado"];
        $telefone = $_POST["telefone"];
        $cep = $_POST["cep"];
        $mensagem = $_POST["mensagem"];

        $host = "localhost";
        $user = "root";
        $senha = "";
        $banco = "descarte_certo";

        $conexao = mysqli_connect($host, $user, $senha, $banco);

        if (!$conexao) {
            die("Conexão falhou: " . mysqli_connect_error());
        }

        $sql = "INSERT INTO sugestoes (nome, endereco, cidade, estado, telefone, cep, mensagem) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        if ($stmt = mysqli_prepare($conexao, $sql)) {
            mysqli_stmt_bind_param($stmt, "sssssss", $nome, $endereco, $cidade, $estado, $telefone, $cep, $mensagem);
            
            if (mysqli_stmt_execute($stmt)) {
                echo "O endereço foi cadastrado com sucesso e será analisado em breve para ser adicionado ao site.";
            } else {
                echo "Erro ao executar a query: " . mysqli_stmt_error($stmt);
            }

            mysqli_stmt_close($stmt);
        } else {
            echo "Erro ao preparar a query: " . mysqli_error($conexao);
        }

        mysqli_close($conexao);

    } else {
        echo "Por favor, preencha todos os campos do formulário.";
    }
}
?>
