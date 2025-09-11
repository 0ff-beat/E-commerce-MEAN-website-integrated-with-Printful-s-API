const searchAlgorithem = async (query,product_model)=>{
    query = await query.trim();
    query = await query.toLowerCase();
    const restrictedCharacters =await ["@","%","`","^","$","#", "&","*","{","}","[","]",",","=","-","(",")",".","+",";","'","/"];
    // console.log(restrictedCharacters[5])
    for(const character of restrictedCharacters ){
        if(query.indexOf(character) != -1){
            query =await query.replace(character,"");
        }
    }
    var words = await query.split(" ");
    words = await words.filter((str)=>{
        if(str == ""){return false}else{return true}
    })
    var keywords_withOtherWords = [];
    for(const word of words){
        if(word.slice(-2).toLowerCase().toString() == "es"){
            await keywords_withOtherWords.push(word.slice(0,word.length-2));
        }else if(word.slice(-1).toLowerCase().toString() == "s"){
            await keywords_withOtherWords.push(word.slice(0,word.length-1));
        }else{
            await keywords_withOtherWords.push(word);
        }
    }
    var keywords =await keywords_withOtherWords.filter((word)=>{
        if(word.toLowerCase().toString() == "and" || word.toLowerCase().toString() == "or" || word.toLowerCase().toString() == "for" || word.toLowerCase().toString() == "a" || word.toLowerCase().toString() == "an"){
            return false;
        }else{return true;}
    });
    var fullProducts =await product_model.find({});
    var allProductModels = await [];
    for(const keyword of keywords){
        for(const document of fullProducts){
            if(document["name"].toLowerCase().indexOf(keyword) != -1){
                await allProductModels.push(document);
            }
        }
    }
    return allProductModels;
};
function countLetter(str,letter){
    var count = 0;
    var strArray = [];
    for(var i=0;i<str.length;i++){
        strArray.push(str.charAt(i));
    }
    for(var i=0;i<str.length;i++){
        if(strArray[i] == letter){
            count += 1;
        }
    }
    return count;
}
module.exports = searchAlgorithem;