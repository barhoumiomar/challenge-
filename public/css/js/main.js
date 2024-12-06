document.querySelectorAll('.rsvp-form').forEach(form => {
form.addEventListener('submit',async (e)=>{
e.preventDefault();
const formData=new FormData(form);
try{
    const response= await fetch(form.action, {
        method:'POST',
        body:'formData',


    });
    if (response.ok){
        window.location.reload();
    }
    }
    catch(err){
        console.error("Error",err);
    }
}

)});

if(document.getElementById('eventDate')){
    flatpickr('#eventDate', {
        enableTime:true,
        dateForamt:"Y-m-d H:i ",
        minDate:"today",
        
    });
}
function showNotification(message, type ='success'){
    const notification=document.createElement('div');
    notification.className=`alert alert-${type} alert-dismissible fate show`;
    notification.role='alert';
    notification.innerHTML=`${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    document.querySelector('.container').insertAdjacentElement('afterbegin', notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);


}

const ticketQuantityInput = document.getElementById('ticketQuantity');
const totalPriceSpan = document.getElementById('totalPrice');

if (ticketQuantityInput && totalPriceSpan) {
    const ticketPrice = parseFloat(document.querySelector('[data-ticket-price]')?.dataset.ticketPrice || 0);
    
    ticketQuantityInput.addEventListener('input', function() {
        const quantity = parseInt(this.value) || 0;
        const total = (quantity * ticketPrice).toFixed(2);
        totalPriceSpan.textContent = total;
    });
}
