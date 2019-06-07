// offline data. Get fire store to sync with indexedDB offline/online
db.enablePersistence()
    .catch(error => {{
        if (error.code === 'failed-precondition') {
            // multiple tabs open at once
            console.log('persistence failed')
        } else if (error.code === 'unimplemented') {
            // lack of browser support
            console.log('persistence is not available')
        }
    }})

// real-time listener for recipes collection. Listens for changes and then snapshots
db.collection('recipes').onSnapshot((snapshot) => {
    //console.log(snapshot.docChanges())
    snapshot.docChanges().forEach((change) => {
        //console.log(change, change.doc.data(), change.doc.id)
        if (change.type === 'added') {
            //add the document data to the web page
            renderRecipe(change.doc.data(), change.doc.id);
        }
        if (change.type === 'removed') {
            // remove the document data from the web page
            removeRecipe(change.doc.id);
        }
    })
})

// add new recipe
const form = document.querySelector('form');
form.addEventListener('submit', event => {
    event.preventDefault(); // prevent page refresh on submission

    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    }

    db.collection('recipes').add(recipe)
        .catch(error => {
            console.log(error)
        })

    form.title.value = ''
    form.ingredients.value = ''
})

// delete recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', event => {
    // console.log(event)

    // if clicked on trash icon ("i" tag)
    if (event.target.tagName === 'I') {
        const id = event.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete();
    }
})