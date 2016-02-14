var random;

random = {
  test: function(val) {
    if (val == null) {
      val = 0.5;
    }
    if (val < 1) {
      return Math.random() < val;
    } else {
      return Math.random() * 100 < val;
    }
  },
  value: function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    if (min >= max) {
      return min;
    } else {
      return Math.floor(Math.random() * (max - min) + min);
    }
  },
  shuffle: function(array) {
    var arrayClone, item, newArray, randomIndex, randomItem;
    arrayClone = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = array.length; i < len; i++) {
        item = array[i];
        results.push(item);
      }
      return results;
    })();
    newArray = [];
    while (arrayClone.length > 0) {
      randomIndex = this.value(0, arrayClone.length);
      randomItem = arrayClone.splice(randomIndex, 1);
      newArray.push.apply(newArray, randomItem);
    }
    return newArray;
  }
};

window.random = random;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVsL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxJQUFBOztBQUFBLE1BQUEsR0FFRTtFQUFBLElBQUEsRUFBTSxTQUFDLEdBQUQ7O01BQUMsTUFBTTs7SUFDWCxJQUFHLEdBQUEsR0FBTSxDQUFUO2FBQWdCLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixJQUFoQztLQUFBLE1BQUE7YUFBeUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLEdBQWhCLEdBQXNCLElBQS9EOztFQURJLENBQU47RUFLQSxLQUFBLEVBQU8sU0FBQyxHQUFELEVBQU0sR0FBTjtJQUNMLElBQU8sV0FBUDtNQUNFLEdBQUEsR0FBTTtNQUNOLEdBQUEsR0FBTSxFQUZSOztJQUdBLElBQUcsR0FBQSxJQUFPLEdBQVY7YUFBbUIsSUFBbkI7S0FBQSxNQUFBO2FBQTRCLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBaEIsR0FBOEIsR0FBekMsRUFBNUI7O0VBSkssQ0FMUDtFQVlBLE9BQUEsRUFBUyxTQUFDLEtBQUQ7QUFDUCxRQUFBO0lBQUEsVUFBQTs7QUFBYztXQUFBLHVDQUFBOztxQkFBQTtBQUFBOzs7SUFDZCxRQUFBLEdBQVc7QUFDWCxXQUFNLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLENBQTFCO01BQ0UsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLFVBQVUsQ0FBQyxNQUF6QjtNQUNkLFVBQUEsR0FBYSxVQUFVLENBQUMsTUFBWCxDQUFrQixXQUFsQixFQUErQixDQUEvQjtNQUNiLFFBQVEsQ0FBQyxJQUFULGlCQUFjLFVBQWQ7SUFIRjtBQUlBLFdBQU87RUFQQSxDQVpUOzs7QUFzQkYsTUFBTSxDQUFDLE1BQVAsR0FBZ0IiLCJmaWxlIjoibW9kZWwvdXRpbHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyAgVGhpcyBmaWxlIGNvbnRhaW5zIHNvbWUgdXRpbGl0aWVzIGZvciBnZW5lcmFsIHVzZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVub1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucmFuZG9tID1cbiAgIyBSZXR1cm4gYSBib29sZWFuIHdpdGggYSBwcm9iYWJpbGl0eSBvZiBiZWluZyB0cnVlIGVxdWFsIHRvIHZhbFxuICB0ZXN0OiAodmFsID0gMC41KSAtPlxuICAgIGlmIHZhbCA8IDEgdGhlbiBNYXRoLnJhbmRvbSgpIDwgdmFsIGVsc2UgTWF0aC5yYW5kb20oKSAqIDEwMCA8IHZhbFxuXG4gICMgR2V0IGEgcmFuZG9tIGludGVnZXIgdmFsdWUgYmV0d2VlbiBtaW4gKGluY2x1ZGVkKSBhbmQgbWF4IChub3QgaW5jbHVkZWQpXG4gICMgSWYgb25seSBvbmUgcGFyYW1ldGVyIGlzIHN1cHBsaWVkLCByZXR1cm4gYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIG1pblxuICB2YWx1ZTogKG1pbiwgbWF4KSAtPlxuICAgIHVubGVzcyBtYXg/XG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcbiAgICBpZiBtaW4gPj0gbWF4IHRoZW4gbWluIGVsc2UgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pXG5cbiAgIyBSZXR1cm4gYSByYW5kb20gYXJyYW5nZW1lbnQgZnJvbSBhbiBhcnJheVxuICBzaHVmZmxlOiAoYXJyYXkpIC0+XG4gICAgYXJyYXlDbG9uZSA9IChpdGVtIGZvciBpdGVtIGluIGFycmF5KVxuICAgIG5ld0FycmF5ID0gW11cbiAgICB3aGlsZSBhcnJheUNsb25lLmxlbmd0aCA+IDBcbiAgICAgIHJhbmRvbUluZGV4ID0gdGhpcy52YWx1ZSgwLCBhcnJheUNsb25lLmxlbmd0aClcbiAgICAgIHJhbmRvbUl0ZW0gPSBhcnJheUNsb25lLnNwbGljZShyYW5kb21JbmRleCwgMSlcbiAgICAgIG5ld0FycmF5LnB1c2gocmFuZG9tSXRlbS4uLilcbiAgICByZXR1cm4gbmV3QXJyYXlcblxuIyBNYWtlIGVsZW1ldHMgYXZhaWxhYmxlIHRvIGFsbCB0aGUgd2luZG93XG53aW5kb3cucmFuZG9tID0gcmFuZG9tXG4iXX0=