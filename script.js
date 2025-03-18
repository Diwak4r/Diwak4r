

// fetch('https://fakestoreapi.com/products')
// .then(Response => Response.json())
// .then(data => console.log(data))


const fetchProduct = async() => {
    const response = await fetch('https://fakestoreapi.com/products')
    const data = await response.json()

    console.log(data)

}

fetchProduct()
