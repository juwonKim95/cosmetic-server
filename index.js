//express 서버 만들기
const express = require("express");
const cors = require("cors");
//mysql 부르기
const mysql = require("mysql");
//서버생성 ---> express()호출
const app = express();
//프로세서의 주소 포트번호 지정
const port = 8080;

const multer = require("multer");
//서버의 upload를 클라이언트 접근가능하도록 설정
//upload없으면 사진에 접근 못함 (http://localhost:8080/upload/cat.jpg 쳐서 사진 나오게 해보기)
app.use("/upload", express.static("upload"));
//json형식의 데이터를 처리할 수 있도록 설정
app.use(express.json());
//브라우저의 CORS이슈를 막기위해 사용하는 코드
app.use(cors());
//diskStorage() ---> 파일을 저장할때의 모든 제어 기능을 제공
//multer는 서버에 파일을 올릴때 쓴다
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
        const newFilename = file.originalname;
        cb(null, newFilename);
    }
});
const upload = multer({ storage: storage });
//post요청이 왔을때 응답처리
app.post('/upload', upload.single('file'), (req, res)=> {
    res.send({
        imageUrl: req.file.filename
    })
});


//연결선 만들기
const conn = mysql.createConnection({
    host: "database-1.ckwviz7gxgq1.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    password: "admin1324",
    port: "3306",
    database: "shopping"
})
//연결하기
conn.connect();
// conn.query(`select * from products`,function(error, result, fields){
//     console.log(result);
// });
//get요청시 응답 app.get(경로, 콜백함수)
app.get('/products', (req, res)=>{
    conn.query(`select * from products`,function(error, result, fields){
        res.send(result);
    });
})
app.get("/products/:id", (req, res)=>{
    const params = req.params; //{id: 2}
    const { id } = params;
    conn.query(`select * from products where p_id=${id}`,
    function(error, result, fields){
        res.send(result);
    });
})
//addProduct post요청이 오면 처리
//req => 요청하는 객체 res => 응답하는 객체
app.post("/addProduct", async(req, res) => {
    const {p_name, p_price, p_desc, p_img, p_quantity } = req.body;
    conn.query("insert into products (p_name, p_price, p_desc, p_img, p_quantity) value(?,?,?,?,?)",
    [p_name, p_price, p_desc, p_img, p_quantity],
    (err, result, fields) => {
        res.send("ok");
    }
    )
})

//삭제요청시 처리하기
app.delete('/delProduct/:id', async (req,res)=>{
    const {id} = req.params;
    conn.query(`delete from products where p_id=${id}`,
    (err,result,fields)=>{
        res.send("ok");
    })
})
//서버를 구동
app.listen(port, ()=>{
    console.log('서버가 돌아가고 있습니다.');
})