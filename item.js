const { StatusCodes, RESET_CONTENT } = require("http-status-codes");
const globals = require("./globals.js");
const file = require("./rwfile");

class Item{
    item_id;
    item_name; 
    item_catrgory;
    item_price;
    ingredients_list = [];
    item_quantity;
    item_description = "";
    constructor(id, name , category , price , ingredients ,quantity , description) {
        this.item_id = id;
        this.item_name = name ;
        this.item_catrgory = category;
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

let create_new_item = async (req , res) => {

    let item_name = req.body.item_name;
    let item_catrgory = req.body.item_catrgory;
    let item_price =  req.body.price;
    let ingredients_list = req.body.ingredients ;
    let item_quantity = req.body.item_quantity; 
    let item_description = req.body.item_description;
    let max_id = 0;
    let item_id ;
    
    if(!item_name || !item_catrgory || !item_price || !ingredients_list)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Parameter missing");
    }

    let is_name_exist = globals.g_items.find(item => item.item_name == item_name);

    if(is_name_exist){
    
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item name already exist");
    }

    if( item_price <= 0 || item_quantity <= 0 )
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Invalid price or quatity");
    }

    if(!globals.g_items.length == 0){
        max_id = 1 ;
    }
    else {
        globals.g_items.forEach( item => {
            if(item.item_id > max_id)
            {
                max_id = item.item_id; 
            }
        })  
    }
    let valid_category = check_category_enum(item_catrgory);
    if(valid_category == 0)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Category does not exist.");
    }

    item_id = max_id +1 ;
    let new_item = new Item( item_id, item_name, item_catrgory, item_price, ingredients_list ,item_quantity, item_description);
 
    globals.g_items.push(new_item);
    await file.save_to_file("items.json",global.g_items);

    res.status(StatusCodes.CREATED);
    res.send(JSON.stringify(new_item));
};

check_category_enum = (num_category) => {
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
}
let get_all_items = (req, res)=> {
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(globals.g_items));
};

let update_item = async (req, res) => {
    let new_name = req.body.item_name;
    let id = req.body.item_id;
    let new_price = req.body.price;
    let new_quantity = req.body.quantity;
    let new_description = req.body.quantity;


    let is_exists = globals.g_items.find(item => { item.item_id == id })
    if(!is_exists) 
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item does not exist");
    }

    globals.g_items.forEach(item => {
        if(item.item_id == id)
        {
            if(new_price && new_price > 0)
            {
                  item.item_price = new_price ;
            }
            if(new_name)
            {
                item.name = new_name;
            }
            if(new_quantity && new_quantity > 0){
                item.item_quantity =  new_quantity;
            }
            if(new_description){
                item.item_description =  new_description;
            }
        }
    });

    await file.save_to_file("items.json",globals.g_items);

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(globals.g_items));
}

let get_item = (req ,res) => {
    let id_item = parseInt(req.params.id);
    let item_to_find = globals.g_items.find(element => {element.item_id == id_item})
    
    if(!item_to_find)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item does not exists");
        return;
    }

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(item_to_find));
}

let delete_item = async (req , res) =>{
    let id_item_to_delete = req.body.item_id;

    let item_to_delete = globals.g_items.find(item => { item.item_id == id_item_to_delete });
    if(!item_to_delete)
    {
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Item number to delete is not valid.");
        return;
    }

    let idx_item_to_delete = globals.g_items.indexOf(item_to_delete);
    globals.g_items.splice(idx_item_to_delete , 1);
   

    await file.save_to_file("items.json",globals.g_items);

    res.status(StatusCodes.OK);
    res.send("Item deleted successfully! 😊😊");
}

let get_items_by_category = (req, res) => {
    let item_category = parseInt(req.params.category);
    let items_by_category = [] ;

    globals.g_items.forEach(item => {
        if(item.item_category == item_category)
        {
            items_by_category.push(item);
        }
    })
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
