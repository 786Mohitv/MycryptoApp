function result(Json){
  Json.coins.forEach(function(item){

    const divList = document.querySelector('.search-list')
    const ul = divList.querySelector('ul');
    const li = document.createElement('li');
    li.innerHTML = "<a href='/coin/"+item.id+"' style='color:black;' type='sumbit'><strong>"+item.name+"</strong></a>";
    ul.appendChild(li);
  })
}
const userAction = async () => {
  const toSearch = document.getElementById('search-focus').value;
  const url1 = "https://api.coingecko.com/api/v3/search?query=" + toSearch;
  const response = await fetch(url1);
  const myJson = await response.json(); //extract JSON from the http response
  // do something with myJson
  console.log(myJson);
  result(myJson);
  }
document.addEventListener('click',function (){
  const divList = document.querySelector('.search-list')
  const ul = divList.querySelector('ul');
  var child = ul.lastElementChild;
        while (child) {
            ul.removeChild(child);
            child = ul.lastElementChild;
        }
})
