const { StatusCodes} = require("http-status-codes");

let Status = ["PrePreparation" , "InPreparation", "PostPreparation", "Cancled"];

class Order {
    numOrder;
    tableNumber;
    employeeName;
    employeeId;
    itemsList;
    date;
    time;
    status;
  
    constructor (numOrder,tableNumber, employeeName, date,time, employeeId, status)
    {
      this.numOrder = numOrder ;
      this.tableNumber = tableNumber ;
      this.employeeName = employeeName ;
      this.itemsList = [];
      this.date = date;
      this.time = time;
      this.employeeId = employeeId ;
      this.status = status;
    }
  
    get_numOrder()
    {
      return this.numOrder ;
    }
  
    get_tableNumber()
    {
      return this.tableNumber ;
    }
  
    get_employeeName()
    {
      return this.employeeName ;
    }
  
    get_itemsList()
    {
      return this.itemsList ;
    }

    get_date()
    {
      return this.date ;
    }

    get_employeeId()
    {
      return this.employeeId ;
    }
}

const createNewOrder = async (req , res , client) =>{
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    const tableNumber = req.body.tableNumber ;
    const employeeName = req.body.employeeName;
    const employeeId = req.body.employeeId ;
    const items = req.body.itemsList;
    const status = Status[0];

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let exectDate = (year + "-" + month + "-" + date);
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let exectTime = (hours + ":" + minutes + ":" + seconds);

    let newNumOrder ; 
    let ordersArray = [];

    try{
        ordersArray = await orders.find().toArray();
    }catch(e){
        console.log(e);
    }

    if(ordersArray.length === 0)
    {
        newNumOrder = 1;
    }else{
        newNumOrder = 1;
        ordersArray.forEach(element => {
            if(element.numOrder >= newNumOrder){
                newNumOrder = element.numOrder + 1;
            }
        });
    }

    const newOrder = new Order(
                                newNumOrder,
                                tableNumber,
                                employeeName, 
                                exectDate,
                                exectTime,
                                employeeId,
                                status
                            );
    newOrder.itemsList = [...items];
    
    try{
        await orders.insertOne(newOrder);
    }catch(e){
        console.log(e);
    }

    res.status(StatusCodes.CREATED);
    res.send(JSON.stringify(newOrder));
}

const getAllOrders= async(req, res, client) =>{
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    let ordersArray;
    try{
        ordersArray = await orders.find().toArray();
    }catch(e){
        console.log(e);
    }
    
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(ordersArray));
}

const deleteOrder = async(req, res, client) =>{
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    const orderToDelete = parseInt(req.params.orderNumber);

    try{
        await orders.deleteOne({ numOrder : orderToDelete });
        const ordersArray = await orders.find().toArray();
        res.status(StatusCodes.OK);
        res.send(ordersArray);
    }catch(err) {
        console.log(err);
    }
}

const deleteItemFromOrder = async(req, res, client) =>{
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    const order = parseInt(req.body.orderNumber);
    const item = req.body.itemName;
    //console.log(order);
    try{
        let orderToUpdate = await orders.findOne({ numOrder : order });
        //console.log(orderToUpdate);
        // await orders.deleteOne({ _id : orderToUpdate._id });
        const idx = orderToUpdate.itemsList.findIndex(element => element.name == item);
        console.log(idx);
        if(idx !== null){
            if(orderToUpdate.itemsList[idx].quantity === 1){
                orderToUpdate.itemsList.splice(idx,1);
            }else{
                parseInt(orderToUpdate.itemsList[idx].quantity)--;
            }
            await orders.deleteOne({ _id : orderToUpdate._id });
            await orders.insertOne(orderToUpdate);
            res.status(StatusCodes.OK);
            res.send(orderToUpdate);
        }
      
    }catch(e){
        console.log(e);
    }

//     console.log(orderNumer);

}

const updateOrderData = async (req, res ,client) => {
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
}

const getOrder = async (req , res, client) => {
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    const order = parseInt(req.params.orderNumber);
    console.log(order);
    try{
        let orderToSend = await orders.findOne({numOrder : order}, (error, result)=>{
            if(error) throw error;
            //console.log(result);
            res.status(StatusCodes.OK);
            res.send(result);
        });
    }catch(e){
        console.log(e);
    }
}

const updateOrderStatus = async (req , res , client) => {
    const db = client.db("Management_system");
    const orders = db.collection("Orders");
    const newStatus= req.body.newStatus;
    const orderNumber = parseInt(req.body.orderNumber);

    try{
        let order = await orders.findOne({ numOrder : orderNumber});
        if(order){
            await orders.updateOne({ numOrder : orderNumber}, { $set: {status : newStatus}});
            let ordersArray = await orders.find().toArray();
            res.status(StatusCodes.OK);
            res.send(ordersArray);

        }else{
            res.status(StatusCodes.NOT_FOUND);
            res.send("Order not found.");
        }
    }catch(e){
        console.log(e);
    }
}

module.exports= {
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,
    updateOrderData: updateOrderData,
    deleteOrder: deleteOrder,
    deleteItemFromOrder: deleteItemFromOrder,
    getOrder: getOrder,
    updateOrderStatus :updateOrderStatus
}
