const sql = require("mssql");
const config = require("./config.js");
//console.log(config);
// sql.connect(config)
   // .then(conn => global.conn = conn)
   // .catch(err => console.log(err));

   selectServer(config.machine1); 
   
// createTable();

function createTable(){
      const table = new sql.Table('temp');
      table.create = true;
      table.columns.add('ID', sql.Int, {nullable: false, primary: true});
      table.columns.add('Nome', sql.NVarChar(150), {nullable: false});
      table.columns.add('CPF', sql.NChar(11), {nullable: false});
      table.rows.add(4, 'teste1', '12345678901');
      table.rows.add(5, 'teste2', '09876543210');
      table.rows.add(6, 'teste3', '12312312399');
	  console.log(table.rows); return false;
      const request = new sql.Request()
      request.bulk(table)
		 .then(result => console.log(result))
		 .catch(err => console.log('erro no bulk. ' + err));
		 
	getResult();
}

function getResult(){
	var sqlQry = "select * from temp";
		//console.log("inside");
	const request = new sql.Request()
	request
	   .query(sqlQry)
	   .then(result => insertResult(result.recordset))
	   .catch(err => console.log(err));
}

function insertResult(result) {
	console.log(result); 
	sql.close();
	
	sql.connect(config.machine2, function(err) {
		const table = new sql.Table('temp');
		table.create = false;
		//table.columns.add('ID', sql.Int, {nullable: false, primary: true});
		  table.columns.add('Nome', sql.NVarChar(150), {nullable: false});
		  table.columns.add('CPF', sql.NChar(11), {nullable: false});
		
		for(var i in result) {
			table.rows.add(result[i].Nome, result[i].CPF);
		}
		//console.log(table.rows); return false;
		const request = new sql.Request()
		  request.bulk(table)
			 .then(result => console.log(result))
			 .catch(err => console.log('erro no bulk. ' + err));
	});	
	//getResult();
}

function selectServer(server) {
	sql.connect(server)
	   .then(conn => {
		   console.log("Connection Established"); 
		   getResult();
	   })
	   .catch(err => console.log("erro! " + err));
}


// sql.connect(config.machine1, function(err) {
  // if (err) { 
	// console.log('Connect err: ' + err); 
	// return; 
  // }
  // isConnected = true;
// });

// const table = new sql.Table('#temp') // or temporary table, e.g. #temptable
// table.create = true
// table.columns.add('a', sql.Int, {nullable: true, primary: true})
// table.columns.add('b', sql.VarChar(50), {nullable: false})
// table.rows.add(777, 'test')
 
 
// sql.connect(config).then(pool => {
	
	// const request = new sql.Request()
	// request.bulk(table, (recordset) => {
		// console.log(recordset);
	// })
	
	// var query = "select * from #temp";
								
		// return pool.request()
		// .query(query)
// })
// .then(result => {
	// console.log(result);
	// getResult();
// })
// .then(result => {
	// console.log(result);
// })
// .catch(err => {
 // console.log("err", err);
// });

// getResult = function() {
	// //sql.close();
	// sql.connect(config).then(pool => {
		// var query = "select * from #temp";
								
		// return pool.request()
		// .query(query)
	// }).then(result => {
		// console.log(result);
	// });
// }