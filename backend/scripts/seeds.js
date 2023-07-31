//TODO: seeds script should come here, so we'll be able to put some data in our local env

const { faker } = require("@faker-js/faker");
let mongoose = require("mongoose");

require("../models/User");
require("../models/Item");
require("../models/Comment");

if (!process.env.MONGODB_URI) {
  console.warn("Missing MONGODB_URI in env, please add it to your .env file");
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

let Item = mongoose.model("Item");
let Comment = mongoose.model("Comment");
let User = mongoose.model("User");

function randChoice(choices) {
  let index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

const seed_users = async () => {
  User.deleteMany({}, () => {});
  console.log("seeding users");
  for (let i = 0; i < 100; i++) {
    let new_user = new User();
    new_user.username = faker.string.alphanumeric({
      length: { min: 5, max: 10 },
    });
    new_user.email = faker.internet.email({ firstName: new_user.username });
    new_user.setPassword(
      faker.string.alphanumeric({ length: { min: 10, max: 20 } })
    );
    new_user.save();
  }
  console.log("Finished seeding users");
}

const seed_items = async () => {
  console.log("seeding items");
  Item.deleteMany({}, () => {});
  const tags = ["cat", "dog", "bear"];
  const users = await User.countDocuments({});
  for (let i = 0; i < 100; i++) {
    let new_item = new Item({
      title: faker.string.alpha({ length: { min: 5, max: 10 } }),
      description: faker.lorem.sentence({ min: 3, max: 5 }),
      image: faker.image.url(),
      tageList: [randChoice(tags)],
    });

    new_item.seller = await User.findOne().skip(
      Math.ceil(Math.random() * users),
      (user) => user
    );
    new_item.save();
  }
  console.log("Finished seeding items");
}

const seed_comments = async () => {
  console.log("seeding comments");
  Comment.deleteMany({}, () => {});

  const users = await User.countDocuments({});
  const items = await Item.countDocuments({});

  for (let i = 0; i < 100; i++) {
    let new_comment = new Comment({
      body: faker.lorem.sentence({ min: 3, max: 5 }),
    });

    new_comment.seller = await User.findOne().skip(
      Math.ceil(Math.random() * users)
    );
    new_comment.item = await Item.findOne().skip(
      Math.ceil(Math.random() * items)
    );
    new_comment.save();
  }
  console.log("Finished seeding comments");
}

const seed = async () => {
  seed_users()
  seed_items()
  seed_comments()
}

seed().then(() => process.exit())