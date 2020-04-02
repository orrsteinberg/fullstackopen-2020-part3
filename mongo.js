const mongoose = require('mongoose');

// Check for proper usage
if ( process.argv.length < 3 ) {
    console.log('Usage: node mongo.js <password> <name> <number>');
    process.exit(1)
}

// Connect to DB
const password = process.argv[2];
const url = `mongodb+srv://orr:${password}@cluster0-owfxy.mongodb.net/phonebook-app?retryWrites=true&w=majority`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Create new schema and model
const personSchema = new mongoose.Schema({
    name: String,
    number: String
});
const Person = mongoose.model('Person', personSchema);

// Display all people or add new one depending on the number of arguments provided
if ( process.argv.length === 3 ) {
    console.log('Phonebook:');
    Person.find({}).then(result => {
        result.forEach(person => console.log(person.name, person.number));
        mongoose.connection.close();
    });

} else {
    const newPerson = new Person({
        name: process.argv[3],
        number: process.argv[4]
    });

    newPerson.save().then(response => {
        console.log(`Added ${newPerson.name} number ${newPerson.number} to phonebook`);
        mongoose.connection.close();
    });
}




