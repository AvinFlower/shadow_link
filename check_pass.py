from flask_bcrypt import Bcrypt

def password_try():
    bcrypt = Bcrypt()
    # Хеш пароля из базы данных
    stored_hash = "$2b$12$kotJcciOQaE98i..nRVdeu8HVIrwjyJuIskT.u0s1/UCuipu3nzDe"
    
    password = input("Введите пароль для проверки: ")  # Тот пароль, который хотите проверить

    if bcrypt.check_password_hash(stored_hash, password):
        print("Пароль верный")
        # Генерируем хеш введённого пароля
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        print(f"Хеш введённого пароля: {hashed_password}")
    else:
        print("Неверный пароль")
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        print(f"Хеш введённого пароля: {hashed_password}")
        password_try()  # Рекурсивный вызов при неверном пароле

password_try()