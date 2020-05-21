const PRODUCT_PER_PAGE = 20;
let from =$('#from'),
    before =$('#before');

//Login
function login() {
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
    error: function (xhr, status) {
  
    }
  });
}
//product
function getProduct(){
  $.ajax({
    type: 'GET',
    url: 'http://symfony-erp.intexsoft.by/api/products?page=1',
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
      basketCount()
    },
    error: function (xhr, status) {
      login()
    }
  });
}
getProduct()
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
  error: function (xhr, status) {
    login()
  }
});

$.ajax({
  type: 'GET',
  url: 'http://symfony-erp.intexsoft.by/api/shops',
  crossDomain: true,
  headers: {
    "Authorization": 'Bearer ' + (localStorage.getItem('token')),
  },
  success: function (data) {
    console.log(data);
    
  },
  error: function (xhr, status) {
    login()
  }
});

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
            login()
            clearDocument($('.content'));
            clearDocument($('.pagination'));
            $('.content').append($(`
              <span>No product </span>
            `))
          }
        });
    });
});
//clear Document
function clearDocument(element) {
  element.empty()
}
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
        <p class="count" data-count="${data[count]}">Осталось: ${data[count]}</p>
        <input type="number" id='countProduct' value="1">
        <button type="button" class="addBasketProduct">Buy</button>
        
      </div>
    </div>
  `))
  checkForFilledItem()
  clickBtnAddProduct(data)
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
  console.log(data);
  
  let arrayLength = Math.ceil(data.length / PRODUCT_PER_PAGE)
  clearDocument($('.pagination'))  
  if (data.length > PRODUCT_PER_PAGE) {    
    for (let index = 1; index <= arrayLength; index++) {
      $('.pagination').append($(`
        <span class="pagination-block" >${index}</span>
      `))
    }
  }
  $('.pagination-block:first').addClass('active');
  $('.pagination-block').click(function (e) {
    $('.pagination-block').removeClass('active');
    $(this).addClass('active');
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
  if ($('.pagination-block').html() == pageNumber) {
    
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
// let paginationArray = $('.pagination-block2')
// paginationArray.click(function (element){
//   paginationArray.empty()
  
//   for (let index = 0; index < paginationArray.length; index++) {
//     let thisElementContent =  paginationArray[index];
//     console.log(index);
//     thisElementContent.append(+index + 2)

//     console.log(thisElementContent );
    
//   }
  
// });
$('.basket').click(function (element){

});
//filter filled > 0
function checkForFilledItem() {
  $('#countProduct').change(function() {
    if ($('.count').data('count') < $(this).val() || $(this).val() <= 0) {
      $(".addBasketProduct").prop("disabled", true);
      $(this).addClass('errorMesage')
    } else if ($(this).hasClass('errorMesage')) {
      $(".addBasketProduct").prop("disabled", false);
      $(this).removeClass('errorMesage')
    }
  });
}
//add product in basket
function clickBtnAddProduct(data) {
  console.log(data);
  
  $('.addBasketProduct').click(function(){
    if ($('#countProduct').val() > 0) {
      let  ArrayProductBacket = [];
          //  newObj =  new BuyProduct(1, 1, 1, data.title, $('#countProduct').val(), data.price);
          data.countProduct = $('#countProduct').val();
          newObj = data;
      if (localStorage.getItem('bascketProduct')) {
        ArrayProductBacket = (JSON.parse(localStorage.getItem('bascketProduct')));
        ArrayProductBacket.push(newObj);
        localStorage.setItem('bascketProduct', JSON.stringify(ArrayProductBacket));
        ArrayProductBacket.length = 0
      } else {        
        ArrayProductBacket.push(newObj)
        localStorage.setItem('bascketProduct', JSON.stringify(ArrayProductBacket));
        ArrayProductBacket.length = 0
      }
      basketCount()
    } else {
    }
  })
}
//add basket count product
function basketCount() {
  if (localStorage.getItem('bascketProduct')) {
    let countBascket = JSON.parse(localStorage.getItem('bascketProduct'));
    $('.basket__count').addClass('addProduct');
    $('.basket__count').text(countBascket.length)
  } 
}

function basketPage() {
  $('.basket').click(function(){

    let total = 0;
    basketProductArray = JSON.parse(localStorage.getItem('bascketProduct'));
    clearDocument($('.content'))

    $.each(basketProductArray, function (key, data) {
      $('.content').append($(`
        <div class="basketPage">
          <img src="../img/7-7-450x450.jpg" alt="img">
          <div class="block">
            <h3 class="title">${data.title}</h3>
            <p class="description">${data.description}</p>
            <p class="price">$${data.price}</p>
            <p class="count" data-count="${data.count}">Осталось: ${data.count}</p>
            <input type="number" id='countProduct' value="${data.countProduct}">
          </div>
        </div>
      `))
    })
    for(let i=0;i<basketProductArray.length;i++){
      total = total + parseInt(basketProductArray[i].countProduct * basketProductArray[i].price);
    }
    
    $('.content').append($(`
      <div class="basketPage__issue">
        <span class="price">Total: $${total}</span>
        <form>
        <h3>Form by</h3>
        <input type="text" name="first_name" placeholder="first_name">
        <input type="text" name="last_name" placeholder="last_name">
        <input type="text" name="email_address" placeholder="email_address">
        <input type="text" name="country" placeholder="country">
        <input type="text" name="city" placeholder="city">
        <input type="text" name="street" placeholder="street">
        <input type="text" name="house_number" placeholder="house_number">

        <button type="button" class="addBasketProduct">To issue</button>
        </form>
      </div>`
    ))
  })
}
basketPage()


let buyProductArr = [];
function BuyProduct(item_id, erp_item_id, product, name, count, price) {
    this.item_id = item_id;
    this.erp_item_id = erp_item_id;
    this.product = product;
    this.name = name;
    this.count = count;
    this.price = price;
  }