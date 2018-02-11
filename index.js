const express = require('express');
const http = require('http');
const massive = require('massive');
const app = express();



massive({
  host: '127.0.0.1',
  port: 5432,
  database: 'pgguide1',
  user: 'postgres',
  password: 'andy'
}).then(instance => {
  app.set('db', instance);
  
 
	app.get("/" ,function (req, res){
		res.send("Welcome.......")
	});

/********PART 1 *********************/
/*
GET /users
List all users email and sex in order of most recently created. Do not include password hash in your output

GET /users/:id
Show above details of the specified user

GET /products
List all products in ascending order of price

GET /products/:id
Show details of the specified products

GET /purchases
List purchase items to include the receiver’s name and, address, the purchaser’s email address and the price, 
quantity and delivery status of the purchased item. Order by price in descending order
*/
 
 
	 /**Get users**/
	
	app.get('/users/', (req, res) => {
			req.app
				.get("db").query("select users.email, users.details from users order by created_at desc ;")
				.then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
		});
	
 
 
	/**GET users by id**/
	app.get('/users/:id', function (req, res) {
		
		var id = req.params.id
		req.app.get("db").query("select * from users where id = $1", [id])
				.then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
	})


	/**GET products **/
	app.get('/products', function (req, res) {
		req.app.get("db").query("select * from products")
				.then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
	})
		
	/**GET products by id  **/
	app.get('/products/:id', function (req, res) {
		var id = req.params.id	
		req.app.get("db").query("select * from products where id = $1", [id])
				.then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
	})



/*List purchase items to include the receiver’s name and, address, the purchaser’s email address and the price, 
quantity and delivery status of the purchased item. Order by price in descending order
*/
	app.get("/purchaes", (req, res) => {
			req.app
				.get("db").query('SELECT purchases.name, purchases.address, users.email, purchase_items.price,purchase_items.quantity, purchase_items.state FROM purchases, users, purchase_items WHERE purchases.user_id = users.id AND purchases.id = purchase_items.purchase_id ORDER BY price DESC;')
				.then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
		});


//****************END part 1 *************//	
	

//*****************************PART 2******************************//
/*
Building on your solution to part 1 for the API to the products resource from the pgguide database,
 extend the product indexing endpoint to allow the filtering of products by name as follows
 GET /products[?name=string]
 For your solution you should implement the query (badly) in such a way as to allow an attacker to inject arbitrary SQL code into the query execution. 
 Show, using your badly implemented approach, how an attacker can craft a query string to allow the deletion of a product from the products table.
 For convenience, you can continue to use MassiveJS to interface with the database.

*/


//Bad query with sql injection possible//
	app.get('/injection/', (req, res) => {
		//petend user thped this in 
		var title = "'Dictionary'; Select * from users";
		//this is our nomal sql looking for products by title
		var sql = "select * from products where products.title = $1";
		req.app.get("db").query("select *  from products where products.title =" + title + ";").then (items => {
			res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
				
		})

	//Safe query with sql no injection possible//
	app.get('/SafeSql/:title', function (req, res) {
		var title = req.params.title;
		req.app.get("db").query("select * from products where title = $1", [title]).then(items => {
					res.status(200).json(items);
				})
				.catch(error => res.status(400).send(error));
	})
  http.createServer(app).listen(3000);
});