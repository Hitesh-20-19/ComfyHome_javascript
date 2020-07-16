const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "s75wx7bnjxio",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "r0XinHSFxSfiMSuY97O3YgxnQKPYod14LUQZF7ex56Y"
  });



const clearCartBtn = document.getElementById("clear-cart")
const cartTotal = document.querySelector("#total-price")
const productDOM = document.querySelector("#dom")
const nav = document.querySelector("#nav")
const cartContent = document.querySelector(".modal-body")
const cartNumber = document.querySelector(".cart-text")

//CART
let cart=[]

let buttonsDOM = []

//Getting products
class Products{
    async getProducts(){
        try{

            let contentful = await client.getEntries({
                content_type: 'comfyHome'
            })
            
            //let result = await fetch("products.json")
            //let data = await result.json();
            
            let products= contentful.items;
            products = products.map(item=>{
                const {title,price} = item.fields
                const {id} = item.sys
                const image = item.fields.image.fields.file.url;
                return{title,price,id,image}
            })
            return products
            
        }catch(error){
        console.log(error)
        }
    }
}

//Display Products
class UI{
    displayProducts(products){
        let result =''
        products.forEach(product => {
            result += `
            <div class="col mb-4">
            <div class="card">
                <img src=${product.image} class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">$${product.price}</p>
                <button type="button" data-id=${product.id} data-toggle="modal" data-target="#staticBackdrop" class="btn btn-outline-warning rounded-pill cart-btn" >Add to cart</button>
            </div>
            </div>
            </div> `
        });
        productDOM.innerHTML = result
    }

    getBagButtons(){
        const buttons =[...document.querySelectorAll(".cart-btn")]

        buttonsDOM = buttons;

        buttons.forEach(button =>{
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if(inCart){
                button.innerHTML = "In Cart";
                button.disabled = true
            }
            else{
                button.addEventListener("click",(event)=>{
                   
                    event.target.innerText = "In Cart "
                    event.target.disabled = true


                    let cartItem = {...Storage.getProduct(id),amount:1}
                    cart =[...cart,cartItem]

                    Storage.saveCart(cart)

                    this.setCartValues(cart)

                    this.addCartItem(cartItem)

                })
            }
        })
    }

    setCartValues(cart){
        let tempTotal =0 
        let itemsTotal = 0
        cart.map(item=>{
          tempTotal += item.price * item.amount 
          itemsTotal += item.amount 
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartNumber.innerHTML =parseFloat(itemsTotal.toFixed(2))
    }

    addCartItem(item){
        const div= document.createElement('div')
        div.classList.add("modal-items")
        div.innerHTML = `
        <div class="card mb-3" >
          <img src=${item.image} class="card-img-top" alt="...">
          <div class="card-body card-items" id="card-body">
            <h5 class="card-title">${item.title}</h5>
            <h5 class="card-text">$${item.price}</h5>
            <h6 class="remove-item " data-id=${item.id}>remove</h6>
            <div class="icon">
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="items-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          </div>
        </div>
        `
        cartContent.appendChild(div)
    }

    clearLogic(){
        clearCartBtn.addEventListener("click",() =>{
            this.clearCart()
        })

        cartContent.addEventListener('click',event=>{
            
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target
              
                let id = removeItem.dataset.id
               cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
               this.removeItem(id)
            }

            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addAmount.nextElementSibling.innerHTML = tempItem.amount
            }

            else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if(tempItem.amount > 0){
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.previousElementSibling.innerHTML = tempItem.amount
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement.parentElement)
                    this.removeItem(id)
                }
            }
        })
    }

    clearCart(){
        let cartItems = cart.map(item => item.id)

        cartItems.forEach(id => this.removeItem(id))
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }


    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = "Add to cart";
    }
    
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }
    
}

//Local Storage
class Storage{
    static saveProduct(products){
        localStorage.setItem("products",JSON.stringify(products))
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))

        return products.find(product => product.id === id)
    }

    static saveCart(){
        localStorage.setItem('cart',JSON.stringify(cart))
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI()
    const products = new Products()

    //Get all products 
    products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProduct(products)
    }).then(()=>{
        ui.getBagButtons()
        ui.clearLogic()
    })
    
})