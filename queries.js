function CreateTable() {
    return "CREATE TABLE `database1`.`employee table`(`employeeID` INT NOT NULL,`fname` VARCHAR(45) NOT NULL,`lname` VARCHAR(45),`age` INT NULL,PRIMARY KEY(`employeeID`))"
}

function Update(setQuery, tableName, locationQuery) {
    return "UPDATE `database1`.`" + tableName + "` SET `" + setQuery.name + "`='" + setQuery.value + "' WHERE `" + locationQuery.name + "`=" + locationQuery.value;
}

module.exports = { Update };