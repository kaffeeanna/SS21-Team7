setInterval(()=>{
    fetch("/data", { method: "GET" }).then(response => 
        {
            response.json().then((json)=>{
                console.log(json);
                updateHTML(json);
            });
            // console.log(response);
            // const reader = response.body.getReader(); 
            // reader.read().then((val)=>{console.log(val)})
        })
    }, 1000);

    function updateHTML(json){
        let h1 = document.getElementById("1");

        h1.innerHTML = json.name;
        }