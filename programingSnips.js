getCard = function(b){
    nextStart = new Promise((res,reject)=>{
        go=res;
        console.log(go)
    });
    return new Promise((res,err)=>{
        a%2?res(a):err(a)
    }).then(
        (yup)=>{
            console.log('it is ',yup);
            return yup
        },
        async function(a){
            console.log('waiting');
            await nextStart;
            console.log(a);
            nextStart = new Promise((res,reject)=>{
                go=res;
                console.log(go)
            });
            return getCard(a/2)
        }
    )
}

function playersCard(a){ 
    return new Promise((res,err)=>{
        a%2?res(a):err(a)
    })
}


test = {resolve:[],
    init:function(){this.tableCards = new Array(players.length).fill().map((value,index)=>{
            output = Promise.withResolvers()
            this.resolve[index] = output.resolve
            return output.promise.then((result) => {
                this.ledSuit = result.ledSuit
                return result.tableCard
            })
        },this)}
   }

   

   <a href=https://discord.com/channels/869033842185494578/869033842185494583>go to discord</a>
