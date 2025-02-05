const mongoose = require("mongoose");

/*
  Env variables
*/
const DATABASE = "mongodb+srv://hemant:<PASSWORD>@cluster0.kxgkf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const DATABASE_PASSWORD = "password12349876"
const PORT = process.env.PORT ||  8000

const app = require("./app");

const DB = DATABASE.replace(
  "<PASSWORD>",
  DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Successfully connected to DB"));

  
const server = app.listen(PORT, () => {
  console.log(`App running on port - ${PORT}`);
});
