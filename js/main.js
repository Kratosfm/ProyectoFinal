$(document).ready(function(){
  $('.delete-pet').on('click',function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url:'/pet/'+id,
      success: function(response){
        alert('Deleting Pet');
        window.location.href='/mypets';
      },
      error: function(err){
        console.log(err); 
      }
    });
  });
});
