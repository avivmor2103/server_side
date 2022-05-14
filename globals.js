let token_map = new Map();
let g_users = [];
let g_tables = [] ;
let g_items = [];
let g_position = ["Manager" , "Cheff", "Bartender", "Waiter", "host", "Cook" ];

function get_active_user(req)
{ 
	const token = req.headers.authorization;
	let user = token_map.get(token);
    
	if(!user || user.status != 'Active')
	{
		return undefined;
	}
	return user;
}

module.exports = {
    token_map : token_map,
    g_users : g_users,
    g_position : g_position , 
	g_tables : g_tables,
	g_items : g_items,
	get_active_user : get_active_user
}