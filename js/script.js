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
