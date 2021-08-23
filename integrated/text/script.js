document.getElementById("form1").addEventListener("change", () => {

    if (document.getElementById("form1").value ===  "dog"){
        document.getElementById("result").innerHTML = "Result - Dog"
        document.getElementById("result").setAttribute("href", "../dog/")     
      } else if (document.getElementById("form1").value ===  "car"){
        document.getElementById("result").innerHTML = "Result - Car"
        document.getElementById("result").setAttribute("href", "../car/")    
      } else if (document.getElementById("form1").value ===  "flower"){
        document.getElementById("result").innerHTML = "Result - Flower"
        document.getElementById("result").setAttribute("href", "../flower/")    
      } else if (document.getElementById("form1").value ===  "space"){
        document.getElementById("result").innerHTML = "Result - Space"
        document.getElementById("result").setAttribute("href", "../space/")    
      } else {
        document.getElementById("result").innerHTML = "No Result - Please Try Again"
        // document.getElementById("result").setAttribute("href", "../space/")    
      }
    
})