// validate existing documents who comes to terms with a given query equal to the reference
exports.existingDocuments = async (model, query, referenceArray) => {
    const found = await model.where(query)
      .in(referenceArray)
      .countDocuments();
    
    if (found !== referenceArray.length) {
      return false
    }
    return true;
}