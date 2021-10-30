module.exports = async (client, thread) => {
    if(thread.joinable){
        try{
            await thread.join();
        }catch (e){
            console.log(e)
        }
    }
}
/**
 * @INFO
 * Bot Coded by tibbaR#8979 | 
 * @INFO
 * Work for lqhaiii Development | https://lqhaiii
 * @INFO
 * 
*/
