let mongoose = require('mongoose');

let petSchema = mongoose.Schema({
  name:{
    type: String,
    require: true
  },
  animal:{
    type: String,
    require: true
  },
  age:{
    type: String,
    require: true
  },
  owner:{
    type: String,
    require: true
  },
  ownername:{
    type: String,
    require: true
  },
  public:{
    type: String,
    require: true
  }
});

let Pet = module.exports = mongoose.model('Pet', petSchema,'pets');
