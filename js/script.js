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
      console.log(data["hydra:member"]);
      
      addPagination(data["hydra:member"])
      showPagePagination(data["hydra:member"], 1);
      filterProduct(data["hydra:member"]);
  },
  error: function (xhr, status) {
    
  }
});
//Get Categories
$.ajax({
  type: 'GET',
  url: 'http://symfony-erp.intexsoft.by/api/catalog_trees',
  crossDomain: true,
  headers: { 
      "Authorization":  'Bearer ' + (localStorage.getItem('token')),
  },
  success: function (data) {
      addCategories(data["hydra:member"])
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

function addCategories(data) {
  $.each(data,function(key,data) {
      $('.siteBar').append($(`
      <div class="nav-link">
        <a href="${ data["@id"] }">${data["title"]}</a>
      </div>
    `))
  })
  ajaxCategories(data)
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

function filterProduct(data) {
  $('.btn').click(function(e) {
    e.preventDefault()
    sortInNumericalOrder(data, `${$(this).attr('href')}`)
    clearDocument($('.content'))
    showPagePagination(data, 1);
  })
  
}



function ajaxCategories(data) {
  $('.nav-link a').click(function(e) {
    e.preventDefault()
    let category_url = `http://symfony-erp.intexsoft.by${$(this).attr('href')}`
    let array = []
     $.ajax({
         url: category_url,
         type: 'GET',
         headers: { 
          "Authorization":  'Bearer ' + (localStorage.getItem('token')),
        },
         success:  function (data) {
              clearDocument($('.content'))
              $.each(data["products"], function(key,data){
                array.push(data)
              })
              // $.each(data,function(key,data) {
              // console.log(['products']);

              // $('.content').append($(`
              // <div class="nav-link">
              //   <a href="${ key["@id"] }">${key["title"]}</a>
              // </div>
              // `))
            // })
          //    $.ajax({
          //     url: category_url,
          //     type: 'GET',
          //     headers: { 
          //      "Authorization":  'Bearer ' + (localStorage.getItem('token')),
          //    },
          //     success:  function (data) {
          //         clearDocument($('.content'))
          //         $('.content').append( $(data).find('.content').html() )
          //      },
          //     error: function (xhr, status) {
               
          //    }
          // })
          },
         error: function (xhr, status) {
          
        }
     })
    //product
    $.ajax({
      type: 'GET',
      url: 'http://symfony-erp.intexsoft.by/api/products',
      crossDomain: true,
      headers: { 
          "Authorization":  'Bearer ' + (localStorage.getItem('token')),
      },
      success: function (data) {
       let newArr = [];

     $.each(data["hydra:member"], function(key,data){
       newArr.push(data["@id"])
      console.log(newArr);
      console.log(array);

    })
          // addPagination(data["hydra:member"])
          // showPagePagination(data["hydra:member"], 1);
          // filterProduct(data["hydra:member"]);
      },
      error: function (xhr, status) {
        
      }
    });

 })
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