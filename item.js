const { StatusCodes, RESET_CONTENT } = require("http-status-codes");
const globals = require("./globals.js");
const file = require("./rwfile");


class Item{
    item_id;
    item_name; 
    item_category;
    item_price;
    ingredients_list = [];
    item_quantity;
    item_description = "";
    constructor(id, name , category , price , ingredients ,quantity , description) {
        this.item_id = id;
        this.item_name = name ;
        this.item_category = category;
        this.item_price= price;
        this.ingredients_list =  ingredients;
        this.item_quantity = quantity;
        this.item_description = description ;
    }

    get_price(){
        return this.price ;
    }

    show_description(){
        return this.description
    }

    show_ingredients() {
        return this.ingredients_list ;
    }

    add_quantity(){
        this.item_quantity += 1;
    }
}

const CATEGORY= {
    STARTERS : 1,
    INTERMEDIATE : 2,
    MAIN : 3,
    DESSERT : 4,
    HOT : 5,
    SOFT : 6,
    ALCOHOL : 7
};

async function create_new_item (req , res,client){

    const db = client.db("Management_system");
    const items = db.collection("Items");
    let item_name = req.body.new_item_name;
    let item_category = parseInt(req.body.item_category);
    let item_price =  req.body.price;
    let ingredients_list = req.body.ingredients ;
    let item_quantity = req.body.item_quantity; 
    let item_description = req.body.item_description;
    let item_id , is_name_exist;
    let items_array = [] ;
    items_array = await items.find().toArray();

    if(!item_name || !item_category || !item_price || !ingredients_list)
    {
        res.status(StatusCodes.BAD_REQUEST) ;
        res.send("Parameter missing") ;
        return ;
    }

    
    items_array.forEach( item => {
        if(item_name === item.item_name)
        {
            is_name_exist = true ;
        }
    })

    if( (!item_name) || is_name_exist ){
    
        res.status(StatusCodes.BAD_REQUEST) ;
        res.send("Item name already exist") ;
        return ;
    }

    if( item_price <= 0 || item_quantity <= 0 )
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Invalid price or quatity");
        return ;
    }
    
    if(await items.countDocuments({}) == 0){
        item_id = 1 ;
    }
    else {
        // console.log(await items.countDocuments({}));
        let max_id_item = 0 ;
         await items_array.forEach(item => {
             if(item.item_id > max_id_item)
             {
                max_id_item = item.item_id;
                // console.log(max_id_item);
             }
         })
        item_id = parseInt( max_id_item ) + 1 + "";
        
        console.log(item_id);
    }

    let valid_category = check_category_enum(item_category);

    if(valid_category == 0)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Category does not exist.");
        return;
    }

    let new_item = new Item(
         item_id, 
         item_name, 
         item_category, 
         item_price, 
         ingredients_list ,
         item_quantity, 
         item_description
         );
    try{
        await items.insertOne(new_item);
    }catch(err){
      console.log(err);
    }

    res.status(StatusCodes.CREATED);
    res.send(JSON.stringify(new_item));
    return;
};

function check_category_enum(num_category){
    switch(num_category)
    {
        case 1 :
            num_category = CATEGORY.STARTERS;
            break; 
        case 2 :
            num_category = CATEGORY.INTERMEDIATE;
            break;
        case 3 :
            num_category = CATEGORY.MAIN;
            break; 
        case 4 :
            num_category = CATEGORY.DESSERT;
            break;
        case 5 :
            num_category = CATEGORY.HOT;
            break;
        case 6 :
            num_category = CATEGORY.SOFT;
            break;
        case 7 :
            num_category = CATEGORY.ALCOHOL;
            break;    
        default :  
            num_category = 0 ;
            break;
    }
    return num_category ;
};

async function get_all_items(req, res,client){

    const db = client.db("Management_system");
    const items = db.collection("Items");

    const items_array = await items.find().toArray();
    let items_details_to_show = [] ;

    items_array.forEach( item => {
        let item_to_show = {
           name : item.item_name,
           price : item.item_price,
           description : item.item_description
        };
        items_details_to_show.push(item_to_show);
      });

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(items_details_to_show));
};

async function update_item(req, res,client) {

    const db = client.db("Management_system");
    const items = db.collection("Items");
    let new_name = req.body.item_name;
    let id = req.body.item_id;
    let new_price = req.body.price;
    let new_quantity = req.body.quantity;
    let new_description = req.body.description;

    let is_exists = await items.findOne({item_id : id});

    if(!is_exists) 
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item does not exist");
    }else{
        if(new_name)
        {
            let is_name_exist = await items.findOne({item_name : new_name});
            console.log(is_name_exist);
            if (is_name_exist != null )
            {
                res.status(StatusCodes.BAD_REQUEST);
                res.send("Item name already exist");
            }
            try{
                
                await items.updateOne({ item_name : is_exists.item_name}, { $set : {item_name : new_name}} );
            }catch(error){
                console.log(error);
            }
        }
        if(new_price)
        {
            console.log("hiii")

            try{
                
                await items.updateOne({ item_id : is_exists.item_id}, { $set : {item_price : new_price}} );
            }catch(error){
                console.log(error);
            }
        }
        if(new_quantity && new_quantity >= 0)
        {
            try{
                
                await items.updateOne({ item_id : is_exists.item_id }, { $set : {item_quantity : new_quantity}} );
            }catch(error){
                console.log(error);
            }
        }
        if(new_description)
        {
            try{
                
                await items.updateOne({ item_id : is_exists.item_id }, { $set : {item_description : new_description}} );
            }catch(error){
                console.log(error);
            }
        }
    
    }


    res.status(StatusCodes.OK);
    res.send(JSON.stringify(is_exists));
}

async function get_item(req ,res,client) {
    const db = client.db("Management_system");
    const items = db.collection("Items");
    const id_item = (req.params.id) ;

    const item_to_find = await items.findOne({ item_id : id_item });
    console.log(item_to_find);

    if(item_to_find == null)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item does not exists");
        return;
    }

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(item_to_find));
}

async function delete_item(req , res , client){

    const db = client.db("Management_system");
    const items = db.collection("Items");
    let id_item_to_delete = (req.params.id);

    let item_to_delete =await items.findOne({ item_id : id_item_to_delete });
    console.log(item_to_delete);
    if(!item_to_delete)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item number to delete is not valid.");
        return;
    }
    try{
        await items.deleteOne({_id : item_to_delete._id});
    }catch(err){
        console.log(err);
    }
  

    res.status(StatusCodes.OK);
    res.send("Item deleted successfully!");
}

async function get_items_by_category (req, res, client){
    const db = client.db("Management_system");
    const items = db.collection("Items");
    let item_category = req.params.category;
    const items_by_category = [] ;
    const all_items = await items.find().toArray();
    console.log(item_category);
    all_items.forEach(item => {
        console.log(item) ;
        if(item.item_category == item_category)
        {
            console.log(item) ;
            items_by_category.push(item);
        }

    });

    res.status(StatusCodes.OK); 
    res.send(JSON.stringify(items_by_category));
}

module.exports = {
    create_new_item : create_new_item ,
    update_item : update_item,
    delete_item : delete_item,
    get_item : get_item,
    get_all_items : get_all_items,
    Item : Item,
    get_items_by_category : get_items_by_category
}

