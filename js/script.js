const PRODUCT_PER_PAGE = 5;

//Login
$.ajax({
  type: 'POST',
  url: 'http://symfony-erp.intexsoft.by/api/login_check',
  crossDomain: true,
  contentType: 'application/json',
  dataType: 'json',
  data:JSON.stringify( {
      username: 'test1@test.ru',
      password: '123'
  }),
  xhrFields: {
      withCredentials: false
  },
  success: function (data) {
      localStorage.setItem('token', data.token);
  },
  error: function (xhr, status) {
  }
});
//product
$.ajax({
  type: 'GET',
  url: 'http://symfony-erp.intexsoft.by/api/products',
  crossDomain: true,
  headers: { 
      "Authorization":  'Bearer ' + (localStorage.getItem('token')),
  },
  success: function (data) {
      addPagination(data["hydra:member"])
      showPagePagination(data["hydra:member"], 1);
  },
  error: function (xhr, status) {
    
  }
});

function clearDocument(element){
  element.empty()
}

function addProduct(data) {
  $.each(data,function(key,data) {
    $('.content').append($(`
      <div class="wrapper">
        <h2>${data["title"]}</h2>
        <p>${data["description"]}</p>
        <p>Цена: ${data["price"]}</p>
        <p>Осталось: ${data["count"]}</p>
      </div>
    `))
  })
}

function addPagination(data) {
  let array = data;
  let arrayLength = Math.ceil(array.length / PRODUCT_PER_PAGE)
  // PRODUCT_PER_PAGE
  for (let index = 1; index <= arrayLength; index++) {
    $('.pagination').append($(`
      <span class="pagination-block" >${index}</span>
    `)) 
  }
  $('.pagination-block').click(function(e) {
    showPagePagination(array, +$(this).html());
  })
}

function showPagePagination(array, numberPage) {
    let pageNumber = numberPage,
        start      = (pageNumber - 1) * PRODUCT_PER_PAGE,
        end        = start + PRODUCT_PER_PAGE,
        notes      = array.slice(start, end);
        clearDocument($('.content'))
        addProduct(notes)
}

// Cортировка в числовом порядке можно улучшить функцию reverse
function sortInNumericalOrder(array, key){
  array.sort(function(a,b){
     if (a[key] < b[key]){
        return -1;
     }else if (a[key] > b[key]) {
        return  1;
     }else{
        return 0;
     }     
  })
}