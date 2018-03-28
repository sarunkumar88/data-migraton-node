const sql = require('mssql');
const config = require("./config.js");

var dateobj= new Date();
var month = dateobj.getMonth() + 1;
var day = dateobj.getDate() ;
var year = dateobj.getFullYear();
dateobj.setMonth(dateobj.getMonth() - 1);
var previousMonth = dateobj.getMonth() + 1;
var previousYear = dateobj.getFullYear();
var table = "DeviceLogs_" + month + "_" + year;
var previousTable = "DeviceLogs_" + previousMonth + "_" + previousYear;
var instance = 1;
callServer(instance);

function callServer(instance) {
	sql.connect(config.server1)
	   .then(conn => {
		   console.log("\n\nConnection Established");
		   if(day <= 5 && instance == 1) {
				getLastRecord(previousMonth, previousYear, previousTable);
			} else {
				getLastRecord(month, year, table);
			}
	   })
	   .catch(err => console.log("erro! " + err));
}

	
function getLastRecord(month, year, table) {
	var sqlQry = "select isnull(MAX(pdatetime), '1900-01-01 00:00:00') as maxDate from importdatahistory where month(pdatetime) = " + month + " and year(pdatetime) = " + year;
	
	const request = new sql.Request()
	request
	   .query(sqlQry)
	   .then(result => {
		   fetchData(result.recordset[0].maxDate, table)
	   })
	   .catch(err => console.log("\nLast Record: ", err));
}

function fetchData(maxDate, table) {
	var date = new Date(maxDate);
	
	maxDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() +" " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		
	var sqlQry = `select E.EmployeeCode EmpCode, DL.DownloadDate pDate, DL.LogDate pDateTime, D.DeviceLocation  LocationId
				from Employees E inner join ` + table + ` DL on E.EmployeeCodeIndevice = DL.UserId 
				inner join Devices D on DL.DeviceId = D.DeviceId where DL.LogDate > '` + maxDate + `'`; 
						
	const request = new sql.Request()
	request
	   .query(sqlQry)
	   .then(result => insertData(result.recordset))
	   .catch(err => console.log("\n\nFetch Data", err));
}

function insertData(result) {
	sql.close();
	sql.connect(config.server2, function(err) {
		const table = new sql.Table('importdatahistory');
		table.create = false;
		table.columns.add('empcode', sql.NVarChar(100), { nullable: true });
		table.columns.add('pdate', sql.DateTime, { nullable: true });		
		table.columns.add('pdatetime', sql.DateTime, { nullable: true });
		table.columns.add('locationid', sql.SmallInt, { nullable: true });
		
		for(var i in result) {
			table.rows.add(result[i].EmpCode, result[i].pDate, result[i].pDateTime, result[i].LocationId);
		}	
		
		const request = new sql.Request();
		request.bulk(table)
			.then(result => {
				console.log("\n\n", result.rowsAffected, " records inserted");
				sql.close();
				instance++;
				if(instance == 2) {
					callServer(instance);
				}
			})
			.catch(err => console.log('\nError on bulk Insert:\n\n ' + err));
	});
}