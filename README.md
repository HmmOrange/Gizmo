# Gizmo

Project nhóm 5

- Lê Anh Duy (C) - 23021501
- Vũ Việt Anh - 23021473
- Nguyễn Chí Công - 23021481
- Nguyễn Quang Dũng - 23021497
- Lê Tùng Dương - 23021509
- Đỗ Thành Đạt - 23021517
- Nguyễn Tiến Đạt - 23021521
- Phạm Hoàng An Khánh - 23021597

# Cách chạy

Nếu chạy lần đầu
```bash
git clone
```

Nếu đang làm
```bash
git pull
```

Sau đó clone mỗi submodule về:
```bash
git clone https://github.com/HmmOrange/gizmo-backend
git clone https://github.com/HmmOrange/gizmo-frontend
```

## Backend
```
cd gizmo-backend
```

Tạo file env như sau:
```
PORT=3000
MONGO_URI=<một URI nào đó mà test>
```

rồi 
```bash 
npm install
npm run dev
```

## Frontend
```
cd gizmo-frontend
```

rồi
```bash 
npm install
npm run dev
```