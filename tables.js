const { StatusCodes, RESET_CONTENT } = require("http-status-codes");
const globals = require("./globals.js");
const file = require("./rwfile");
const { table } = require("console");

const EREA = {
    INSIDE : 1,
    BALCONY : 2,
    BAR : 3,
    YARD : 4
 };

class Table {
    num_table ;
    num_seats ;
    is_available ;
    erea ;
    items_array = [] ;
    

    constructor(num , seats , is_available , erea) 
    {
        this.num_table = num ;
        this.num_seats = seats;
        this.is_available = is_available;
        this.erea = erea ;
    } 

    add_item(item){
       this.items_array.push(item)
    }
    
    delete_item(item){
        let idx = this.items_array.indexOf(item);
        this.items_array.splice(idx , 1) ;
    }

    total_check(){
        let sum = 0 ;
        this.items_array.forEach( item => {
            sum = sum + item.get_price();  /// לבדוק בזמן ריצה
        });
        return sum ;
    }
}


async function new_table(req, res, client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let num_table = req.body.num_table;
    let num_seats = req.body.num_seats;
    let is_available;
    let erea = parseInt(req.body.erea);

    let is_table_exist = await tables.findOne({ num_table: num_table });
    console.log(is_table_exist);

    if (is_table_exist != null) {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Num table is already exist");
    }

    if (num_seats < 0) {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Num sites is not a valid number");
    }

    is_available = true;
    switch (erea) {
        case 1:
            erea = EREA.INSIDE;
            if (num_table > 10) {
                res.status(StatusCodes.BAD_REQUEST);
                res.send("Table numer is not match the table number erea");
            }
            break;
        case 2:
            erea = EREA.BALCONY;
            if (num_table > 20) {
                res.status(StatusCodes.BAD_REQUEST);
                res.send("Table numer is not match the table number erea");
            }
            break;
        case 3:
            erea = EREA.BAR;
            if (num_table > 30) {
                res.status(StatusCodes.BAD_REQUEST);
                res.send("Table numer is not match the table number erea");
            }
            break;
        case 4:
            erea = EREA.YARD;
            if (num_table > 40) {
                res.status(StatusCodes.BAD_REQUEST);
                res.send("Table numer is not match the table number erea");
            }
            break;
        default:
            res.status(StatusCodes.BAD_REQUEST);
            res.send("Number of erea is not defined");
    }

    let new_table = new Table(num_table, num_seats, is_available, erea);
    await tables.insertOne(new_table);
    console.log("Table created successfully!");
    res.status(StatusCodes.CREATED);
    res.send(JSON.stringify(new_table));
}

async function table_to_delete(req, res, client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let delete_num_table = req.params.id;
    let table_to_delete = await tables.findOne({ num_table : delete_num_table });

    if (table_to_delete == null) {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Table number to delete is not valid.");
        return;
    }
    await tables.deleteOne({ num_table : delete_num_table });
    const tablesArray = await tables.find().toArray();
    res.status(StatusCodes.OK);
    res.send(tablesArray);
}

async function update_table(req, res , client ) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let num_table = req.body.num_table;
    let new_num_seat = req.body.num_seats;
    console.log(num_table);
    console.log(new_num_seat);

    let table_to_update = await tables.findOne({ num_table : num_table });
    console.log(table_to_update);
    if (table_to_update == null ) {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Num table is not exist");
    }
    await tables.updateOne({num_table : num_table }, {$set :{ num_seats : new_num_seat}});
    res.status(StatusCodes.OK);
    res.send("Table updated successfully !!😊😊");
}

async function get_table(req, res, client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let num_table_to_get = req.params.num_table;
    const table = await tables.findOne({ nume_table :  num_table_to_get });
    if (table == null) {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Num table is not exist");
        return;
    }

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(table));
}

async function all_tables(req, res , client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    
    const tables_to_show = await tables.find().toArray();
    console.log(tables_to_show);
    let show = []; 
    tables_to_show.forEach( table => {
        let table_to_add ={ 
            num_table : table.num_table,
            num_seats : table.num_seats, 
            is_available : table.is_available
        } ;
        show.push(table_to_add);
    })
    console.log(tables_to_show);
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(show));
}

async function add_item_to_table(req, res, client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    const items = db.collection("Items");

    let id_table = req.body.num_table;
    let new_items_array = req.body.items_array;
    //let price_item = req.body.price;

    // const newItem = {
    //     name : id_item,
    //     id : price_item
    // }
    const table_name = await tables.findOne({ num_table : id_table});
    console.log(table_name);
    await tables.updateOne({ num_table : id_table} , { $set : {items_array : new_items_array }});
    res.status(StatusCodes.OK);
    res.send(`Item add successfully to table  : ${id_table}`);
}

async function delete_item_from_table(req, res , client) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    const items = db.collection("Items");

    let id_table = req.body.table_id;
    let id_item = req.body.item_id;

    const item_name = await items.findOne({ item_id : id_item});
    await tables.deleteOne({ num_table : id_table} , { $pull : {items_array : item_name }});
    res.status(StatusCodes.OK);
    res.send(`Item deleted successfully to table  : ${id_table}`);
}

//need to takecare of that soon....
async function table_total_checkout(req, res) {
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let id_table = req.body.num_table;
    
    let sum = table.total_check();
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(sum));
}

async function get_tables_by_erea(req , res , client){
    const db = client.db("Management_system");
    const tables = db.collection("Tables");
    let erea_type = parseInt( req.params.erea);
    let tables_erea_type = [];
    let tables_array = [];

    //console.log("In function")

    if( erea_type === "" )
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("No such an option.");
        return ;
    }
    try{
        tables_array =await tables.find().toArray();
        //console.log(tables_array);
        tables_array.forEach( t => {
            if(t.erea === erea_type)
            {
                tables_erea_type.push(t) ;
            }
        })
    }catch(err){
        console.log(err);
    }
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(tables_erea_type));
    return ;
}

module.exports = {
    new_table : new_table ,
    update_table : update_table,
    table_to_delete : table_to_delete,
    get_table : get_table,
    all_tables : all_tables, 
    add_item_to_table : add_item_to_table,
    delete_item_from_table : delete_item_from_table ,
    table_total_checkout : table_total_checkout, 
    get_tables_by_erea : get_tables_by_erea 
}
