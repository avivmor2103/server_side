const { StatusCodes } = require("http-status-codes");

class OrdersHistory {
    historyId;
    numTable;
    itemsList;
    empolyee;
    totalPrice;
    date;
    time;

    constructor(historyId, numTable , itemsList ,empolyee,totalPrice, date, time){
        this.historyId = historyId;
        this.numTable = numTable;
        this.itemsList = itemsList;
        this.empolyee = empolyee;
        this.totalPrice =totalPrice;
        this.date = date;
        this.time = time;
    }
}

const createNewHistoryOrder = async (req, res, client) => {
    const db = client.db("Management_system");
    const history = db.collection("OrdersHistory");
    const numTable = req.body.numTable;
    const items = req.body.itemsList;
    const employee = req.body.employee;
    const totalPrice = req.body.totalPrice;
    let maxId = 1 ;
    try{
       
        let allHistory = []
        allHistory = await history.find().toArray();
        if(allHistory.length === 0){
            allHistory.forEach(element => { 
                if(element.historyId >= maxId){
                    maxId = element.historyId + 1 ;
                }
            });
        }
    }catch(e){
        console.log(e);
    }


    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let exectDate = (year + "-" + month + "-" + date);
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let exectTime = (hours + ":" + minutes + ":" + seconds);

    const newHistoryObject = new OrdersHistory(
                                                maxId,        
                                                numTable,
                                                items,
                                                employee,
                                                totalPrice,
                                                exectDate,
                                                exectTime
    )

    try{
        await history.insertOne(newHistoryObject);
        const historyArray = await history.find().toArray();
        res.status(StatusCodes.OK);
        res.send(historyArray);
    }catch(e){
        console.log(e);
    }
}

const deleteOrderHistory = async (req, res, client) => {
    const db = client.db("Management_system");
    const history = db.collection("OrdersHistory");
    const orderHistoryId = parseInt(req.params.orderHistoryId);

    try{
        await history.deleteOne( {historyId : orderHistoryId})
        const historyArray = await history.find().toArray();
        res.status(StatusCodes.OK);
        res.send(historyArray);
    }catch(e){
        console.log(e);
    }
}


const getAllHistory = async (req, res, client) =>{ 
    const db = client.db("Management_system");
    const history = db.collection("OrdersHistory");
   
    try{
        const historyArray = await history.find().toArray();
        res.status(StatusCodes.OK);
        res.send(historyArray);
    }catch(e) {
        console.log(e);
    }
}



module.exports = {
    createNewHistoryOrder:createNewHistoryOrder,
    deleteOrderHistory: deleteOrderHistory,
    getAllHistory : getAllHistory
}