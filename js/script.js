const PRODUCT_PER_PAGE = 8;
let from =$('#from'),
    before =$('#before');

//Login
$.ajax({
  type: 'POST',
  url: 'http://symfony-erp.intexsoft.by/api/login_check',
  crossDomain: true,
  contentType: 'application/json',
  dataType: 'json',
  data: JSON.stringify({
    username: 'test1@test.ru',
    password: '123'
  }),
  xhrFields: {
    withCredentials: false
  },
  success: function (data) {
    localStorage.setItem('token', data.token);
  },
  error: function (xhr, status) {}
});
//product
$.ajax({
  type: 'GET',
  url: 'http://symfony-erp.intexsoft.by/api/products',
  crossDomain: true,
  headers: {
    "Authorization": 'Bearer ' + (localStorage.getItem('token')),
  },
  success: function (data) {
    addPagination(data["hydra:member"]);
    showPagePagination(data["hydra:member"], 1);
    filterProduct(data["hydra:member"]);
    productInfo(data["hydra:member"]);
    filterFromToBefore(data["hydra:member"])
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
    "Authorization": 'Bearer ' + (localStorage.getItem('token')),
  },
  success: function (data) {
    addCategories(data["hydra:member"])
  },
  error: function (xhr, status) {}
});

function clearDocument(element) {
  element.empty()
}
//Get search {
  $(document).ready(function(){
    $("#search").on('input', function postinput(){
        var matchvalue = $(this).val();
        $.ajax({
          type: 'POST',
          url: 'http://symfony-erp.intexsoft.by/api/product-search',
          crossDomain: true,
          data :  JSON.stringify({  
                    "search": matchvalue,
                    "count": "200"
                 }),
          headers: {
            "Authorization": 'Bearer ' + (localStorage.getItem('token')),
          },
          success: function (data) {
            addPagination(data);
            showPagePagination(data, 1);
            filterProduct(data);
            productInfo(data);
            filterFromToBefore(data)
          },
          error: function (xhr, status) {
          }
        });
    });
});
//addProduct 
function outputProductTemplate(data, boolean, customClass, title, description, price, count) {
  if (boolean) {
    $.each(data, function (key, data) {
      $('.content').append($(`
        <div class="${customClass}">
          <img src="../img/7-7-450x450.jpg" alt="img">
          <div class="block">
            <a href="${data[title]}" class="title">${data[title]}</a>
            <p class="description">${data[description]}</p>
            <p class="price">$${data[price]}</p>
            <p class="count">Осталось: ${data[count]}</p>
          </div>
        </div>
      `))
    })
  } else {
    $('.content').append($(`
    <div class="${customClass}">
      <img src="../img/7-7-450x450.jpg" alt="img">
      <div class="block">
        <h3 class="title">${data[title]}</h3>
        <p class="description">${data[description]}</p>
        <p class="price">$${data[price]}</p>
        <p class="count">Осталось: ${data[count]}</p>
      </div>
    </div>
  `))
  }

}

function addProduct(data) {
  outputProductTemplate(data, true, 'wrapper', 'title', 'description', 'price', 'count')
}

function addCategories(data) {
  $.each(data, function (key, data) {
    $('.siteBar').append($(`
      <a href="${ data["@id"] }" class="nav-link">
        <span>${data["title"]}</span>
      </a>
    `))
  })
  ajaxCategories(data)
}

function addPagination(data) {
  let arrayLength = Math.ceil(data.length / PRODUCT_PER_PAGE)
  clearDocument($('.pagination'))  
  if (data.length > PRODUCT_PER_PAGE) {
    for (let index = 1; index <= arrayLength; index++) {
      $('.pagination').append($(`
        <span class="pagination-block" >${index}</span>
      `))
    }
  }
  $('.pagination-block').click(function (e) {
    showPagePagination(data, +$(this).html());
  })
}

function showPagePagination(array, numberPage) {

  let pageNumber = numberPage,
    start = (pageNumber - 1) * PRODUCT_PER_PAGE,
    end = start + PRODUCT_PER_PAGE,
    notes = [];
  if (array.length >= PRODUCT_PER_PAGE) {
    notes = array.slice(start, end);
  } else {
    notes = array;
  }    
  clearDocument($('.content'))
  addProduct(notes)
}

function filterProduct(data) {
  $('.btn').click(function (e) {
    e.preventDefault()
    sortInNumericalOrder(data, `${$(this).attr('href')}`)
    clearDocument($('.content'))
    addPagination(data);
    showPagePagination(data, 1);
    productInfo(data) 
  })

}
//Go to categories
function ajaxCategories(data) {
  $('.nav-link').click(function (e) {
    e.preventDefault()
    let category_url = `http://symfony-erp.intexsoft.by${$(this).attr('href')}`
    let array = [];
    $.ajax({
      url: category_url,
      type: 'GET',
      headers: {
        "Authorization": 'Bearer ' + (localStorage.getItem('token')),
      },
      success: function (data) {
          if (data["products"].length > 0) {
            showPagePagination(data["products"], 1);
            addPagination(data["products"]);
            productInfo(data);
          } else {
            clearDocument($('.content'))
            $('.content').append($(`<span>There are no products in this category.</span>`))
            addPagination(data["products"])
            showPagePagination(data["products"], 1);
          }
      },
      error: function (xhr, status) {

      }
    })
  })
}
//Product info
function productInfo(data) {
  $('.title').click(function (e) {
    e.preventDefault()
    let category_url = `http://symfony-erp.intexsoft.by/api/products/${$(this).attr('href')}`
    let array = [];
    $.ajax({
      url: category_url,
      type: 'GET',
      headers: {
        "Authorization": 'Bearer ' + (localStorage.getItem('token')),
      },
      success: function (data) {
        clearDocument($('.content'))
        clearDocument($('.pagination'))

        outputProductTemplate(data, false, 'wrapper single-product-info' , 'title', 'description', 'price', 'count')

      },
      error: function (xhr, status) {

      }
    })
  })
}

// Sorting in numerical order can improve the reverse function
//Comes in [1, 3, 2] comes out [1, 2, 3]
function sortInNumericalOrder(array, key) {
  array.sort(function (a, b) {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      return 0;
    }
  })
}

function filterFromToBefore(data) {
  let filterArray = [];
  $('#filterBtn').click(function () {
    console.log(data);
    console.log(before.val().length);
    
    if (+from.val() < +before.val()) {            
      filterArray = data.filter(function (element) {
        if ( from.val() <= element["price"] && element["price"] <= before.val()) {
          return element ;
        } 
      })
      
    } else {
      filterArray = data.filter(function (element) {
        console.log(2);
        
        if ( from.val() <= element["price"]) {
          return element ;
        }
      })
    }
    //sort array 0++
    sortInNumericalOrder(filterArray, ["price"])
    console.log(filterArray);

    addPagination(filterArray);
    showPagePagination(filterArray, 1);
    filterProduct(filterArray);
  });
}