module.exports = {
    CreateTable: () =>
        `CREATE TABLE 'database1'.'employee table'(
            'employeeID' INT NOT NULL,
            'fname' VARCHAR(45) NOT NULL,
            'lname' VARCHAR(45),
            'age' INT NOT NULL,
            PRIMARY KEY('employeeID')
        )`
    ,

    Update: (setQuery, tableName, locationQuery) =>
        `UPDATE 'database1'.'${tableName}' 
        SET '${setQuery.name}'='${setQuery.value}' 
        WHERE '${locationQuery.name}'='${locationQuery.value}'`
}