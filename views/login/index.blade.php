<!DOCTYPE html>
<html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        @encore_entry_link_tags('login')
        <title>Login</title>
    </head>
    <body>
        <div class="login_content">
            <form method="post">
                <div class="title">
                    <h2>Login</h2>
                </div>
                @if ($error)
                    <div id="alert-error" class="alert alert-danger">
                        {{$error->getMessage()}}
                    </div>
                @endif
                <div class="input-box">
                    <input type="text" name="username" required/>
                    <label>Username</label>
                </div>
                @csrf
                <div class="input-box">
                    <input type="password" name="password" required/>
                    <label>Password</label>
                </div>
                <div class="btn-box">
                    <button class="btn">Entrar</button>
                </div>
            </form>
        </div>
    </body>
</html>


