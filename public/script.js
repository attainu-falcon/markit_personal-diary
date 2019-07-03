// on page refresh, it still displays the content of the prev refresh
$('textarea').html('').val('').text('')
var int = 0

function getHTML(text){    
    var converter = new showdown.Converter();
    var html = converter.makeHtml(text);   
    
    
    $("#markdown").html(html);
    }


$('#pad').on('input', function(){
    text = $(this).val();
    getHTML(text) 
})


changeBackgroundColor = function(){ 
    $(this).css("background-color" , "#D4ECF4") 

    if($(this).find('div').text()=='\u25BE'){$(this).find('div').text('\u25B8')}
    else{$(this).find('div').text('\u25BE')} 

    $('li').not(this).css("background-color" , "transparent")

    $(this).filter(function(){
        return $(this).hasClass('folder') 
    }).next().toggleClass('d-none')    
    
}

$('.create--folder').on('click',function(){
    var value = "untitled_" + int
    int++
    var newli = $('<li class="folder mb-3"><div class="mx-3 d-inline-block">&#x25b8;</div><label class="fa fa-folder-open-o"></label><input  class="files" value=' + value + '  type="text" readonly></li><ul class="notes d-none"></ul>')
    $('.folders').prepend(newli)
})

$('.create--note').on('click', function(){
    var value = "untitled_" + int
    int++
    var newli = '<li class="ml-3 note mb-3"><div class="mx-3 d-inline-block">&#x25b8;</div><label class="fa fa-file"></label><input class="files" value=' + value + ' type="text" readonly></li>' 
    var ul = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]')
    // checking - create note only if folder=blue, no nested note inside a note (i.e. if note=blue)
    .filter(function(){
        // next child is a ul?
        return $(this).next().hasClass("notes")
        // return $(this).find('ul')
        
    })
    // next() ==> next sibling?
    // => <ul class=notes>
    .next()
    // .find('ul')
    console.log(ul)
    
    ul.prepend(newli) 
    var note = value 
    var folder = ul.prev().find('input').val()
    createOrReadNote(note, folder)
})

$(document).on('click', '.note', changeBackgroundColor) 
    
$(document).on('click', '.note', function(){  
        var filename = $(this).find('input').val() 
        var foldername = $(this).parent() 
        .prev().find('input').val()

        console.log(filename, foldername, "onclick note")
        createOrReadNote(filename, foldername)       
        $('.pad--toolbar').removeClass('d-none')
        // $('.edit--note').removeClass('d-none') 
})

function createOrReadNote(note, folder){
    $.ajax({
        url:'notes/read',
        type:'GET',      
        dataType:'text',       
        data: {note:note, folder:folder},        
        success:function(result){            
            // $('textarea').attr('readonly', 'readonly').css('background-color', '#F1F1F1').val(result)  
            $('textarea').attr('readonly', 'readonly').val(result)          
            getHTML(result)
        }
    })
}


$(document).on('click', '.folder', changeBackgroundColor)

        
$(document).on('click', '.folder',function(){
        // $('.save--note').addClass('d-none')
        // $('.edit--note').addClass('d-none')
        $('.pad--toolbar').addClass('d-none')     
        // $('textarea').attr('readyonly', 'readonly').css('background-color', '#F1F1F1').val("")   
        $('textarea').attr('readonly', 'readonly').val("")     
  
        $('#markdown').text("")
    })

// delete a folder OR a note?
$('.delete').on('click', function(){
    var element = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]')
 
    if(element.hasClass('folder')){
        // delete all the siblings in .notes. thus delete all notes
        element.next().remove()
        // delete the folder
        element.remove()
        url = 'notes/delete-a-folder'
        var folder = element.find('input').val()
        console.log(folder, "deleting this folder")
        content = {folder:folder}
    }
    else{
        // find('input') or parent().find('input')?
        var folder = element.parent().prev().find('input').val()
        var note = element.find('input').val()
        element.remove()
        url = 'notes/delete-a-note'
        console.log(note, folder, "deleting note under this folder")
        content = {note:note, folder:folder}
    }
    
    $.ajax({
        url:url,
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify(content),
        success:function(){
            console.log("inside success of /delete-a-note or delete-a-folder")
            // on delete clear the markdown/pad/html
            $('textarea').val('')
            $('#markdown').html('')
        }

    })

})


$('.edit--name').on('click', function(){
    var element = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]').find('input')
    
    element.select()
    element.attr('readonly', false)
    element.css('background-color', 'white')
    element.attr('oldValue',element.val());
})


$(document).on('keypress', '.files', function(e){
    if(e.which==13){
        $(this).attr('readonly', 'true')
        $(this).css('background-color', 'transparent')
        
        old_name = $(this).attr('oldValue')
        new_name = $(this).val() 
        
        if($(this).parent().hasClass('folder') && $(this).parent().next().children().length>0){
            url='notes/edit-folder-name'
            editName(url, old_name, new_name)
        }
        else if($(this).parent().hasClass('note')){
            url='notes/edit-note-name'
            editName(url, old_name, new_name)
        }
        else{}
        
        $(this).attr('oldValue',$(this).val());  
    }
})


function editName(url, old_name, new_name){
    $.ajax({
        url:url,
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify({new_name:new_name, old_name:old_name}),
        success:function(){}
    })
}


$('.save--note').on('click', function(){
    
    console.log("inside save--note")
    var ele = $(this).parent().parent().parent().parent()
    .find('li[style*="background-color: rgb(212, 236, 244)"]')
    
    var note = ele.find('input').val()
    // var folder = ele.parent().prev().find('input').val()
 
    // text=$(this).parent().find('textarea').val() //undefined
    text=$('textarea').val()
    console.log(text)
    console.log(note)

    $.ajax({
        url:'notes/update',
        type:'POST',
        dataType:'json',
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify({note:note, content: text}),
        success:function(result){
            // why isn't it going into success even after saving in db?
            console.log(result, "success of /update")
            // $('textarea').attr('readonly', 'readonly').css('background-color', '#F1F1F1')
            $('textarea').attr('readonly', 'readonly')
            // $('.edit--note').removeClass('d-none') 
            // $('.save--note').addClass('d-none')
            $('.edit--note').attr("disabled", false)
            $('.save--note').attr("disabled", "disabled") 
            console.log("saved note")
        }

    })
})


$('.edit--note').on('click', function(){ 
    $('textarea').attr('readonly', false)
    // .css('background-color', 'white')  
    // $('.save--note').removeClass('d-none')   
    // $('.edit--note').addClass('d-none')
    $('.save--note').attr("disabled", false)
    $('.edit--note').attr("disabled", "disabled") 
})

function offset()
    {
    var ctl = document.getElementById('pad');
    var startPos = ctl.selectionStart;
    var endPos = ctl.selectionEnd;
    return startPos
    //alert(startPos + ", " + endPos);
  
    }


function _(el) {
    return document.getElementById(el);
    }
      
function uploadFile() {
    let index=offset()||0;
    var file = _("file1").files[0];
    // alert(file.name+" | "+file.size+" | "+file.type);
    var formdata = new FormData();
    formdata.append("file", file);
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function()
        {
        if (ajax.readyState == 4 && ajax.status == 200)
            {
            console.log(ajax.responseText)
            let link=(JSON.parse(ajax.responseText).data.image); // Another callback here
            setText(index, link)
            }
        }; 
        
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "upload"); // 
          //use file_upload_parser.php from above url
    ajax.send(formdata);
        
        
    }
         
    $(".export-pdf").on('click', function () {
        var divContents = $("#markdown").html();
        var printWindow = window.open('', '', 'height=400,width=800');
        printWindow.document.write('<html><head><title> Notes</title>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(divContents);
        printWindow.document.write('</body></html>');
        printWindow.print();
        printWindow.close();
        
    });
