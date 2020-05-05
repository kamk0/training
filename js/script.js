const PRODUCT_PER_PAGE = 8;

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
        <img src="../img/7-7-450x450.jpg" alt="img">
        <a href="#" class="title">${data["title"]}</a>
        <p class="description">${data["description"]}</p>
        <p class="price">$${data["price"]}</p>
        <p class="count">Осталось: ${data["count"]}</p>
      </div>
    `))
  })
}

function addCategories(data) {
  $.each(data,function(key,data) {
      $('.siteBar').append($(`
      <a href="${ data["@id"] }" class="nav-link">
        <span>${data["title"]}</span>
      </a>
    `))
  })
  ajaxCategories(data)
}

function addPagination(data) {
  let array = data;
  let arrayLength = Math.ceil(array.length / PRODUCT_PER_PAGE)
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
//Go to categories
function ajaxCategories(data) {
  $('.nav-link').click(function(e) {
    e.preventDefault()
    let category_url = `http://symfony-erp.intexsoft.by${$(this).attr('href')}`
    let array = [];
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
              return array;
          },
         error: function (xhr, status) {
          
        }
     })
    //Add a product from a category on a page
    $.ajax({
      type: 'GET',
      url: 'http://symfony-erp.intexsoft.by/api/products',
      crossDomain: true,
      headers: { 
          "Authorization":  'Bearer ' + (localStorage.getItem('token')),
      },
      success: function (data) {
        let newArr = [];
        $.each(array, function(key,value){
          for (let index = 0; index < data["hydra:member"].length; index++) {
            if (value == data["hydra:member"][index]["@id"]) {
              newArr.push(data["hydra:member"][index])
            }  
          }
        })

        if (newArr.length > 0) {
      console.log(newArr);
          
          showPagePagination(newArr, 1);
        } else {
          clearDocument($('.content'))
          $('.content').append($(`<span>There are no products in this category.</span>`))
        }
      },
      error: function (xhr, status) {
        
      }
    });
 })
}

// Sorting in numerical order can improve the reverse function
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
