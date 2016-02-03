this.NumericInput = (function() {
  function NumericInput(id, label, min, max, step, disabled) {
    this.id = id;
    this.label = label;
    this.min = min;
    this.max = max;
    this.step = step;
    this.disabled = disabled;
    this.html = "<div class=\"form-group\">\n  <label for=\"" + this.id + "\"\n      class=\"control-label col-sm-6 col-xs-5\">" + this.label + ":</label>\n  <div class=\"col-sm-4 col-xs-7\">\n    <input type=\"number\" class=\"form-control input-sm\"\n        " + (this.min != null ? 'min="' + this.min + '"' : '') + "\n        " + (this.max != null ? 'max="' + this.max + '"' : '') + "\n        " + (this.step != null ? 'step="' + this.step + '"' : '') + "\n        id=\"" + this.id + "\" " + (this.disabled ? 'disabled' : '') + " >\n  </div>\n</div>";
  }

  NumericInput.prototype.set = function(value) {
    return $('#' + this.id).val(value);
  };

  NumericInput.prototype.get = function() {
    return parseInt($('#' + this.id).val());
  };

  NumericInput.prototype.setListener = function(callback) {
    return $('#' + this.id).change(callback);
  };

  NumericInput.prototype.disable = function() {
    return $('#' + this.id).removeAttr('disabled', '');
  };

  NumericInput.prototype.enable = function() {
    return $('#' + this.id).attr('disabled', '');
  };

  return NumericInput;

})();

this.ToggleInput = (function() {
  function ToggleInput(id, label, disabled) {
    this.id = id;
    this.label = label;
    this.disabled = disabled;
    this.html = "<div class=\"form-group\">\n    <label for=\"" + this.id + "\"\n      class=\"control-label col-sm-6 col-xs-5\">" + this.label + ":</label>\n    <div class=\"col-sm-4 col-xs-7\">\n      <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" id=\"" + this.id + "\"\n              " + (this.disabled ? 'disabled' : '') + "> Enabled\n        </label>\n      </div>\n    </div>\n</div>";
  }

  ToggleInput.prototype.set = function(value) {
    return $('#' + this.id).prop("checked", value ? "on" : false);
  };

  ToggleInput.prototype.get = function(value) {
    return $('#' + this.id).prop("checked");
  };

  ToggleInput.prototype.setListener = function(callback) {
    return $('#' + this.id).change(callback);
  };

  ToggleInput.prototype.disable = function() {
    return $('#' + this.id).removeAttr('disabled', '');
  };

  ToggleInput.prototype.enable = function() {
    return $('#' + this.id).attr('disabled', '');
  };

  return ToggleInput;

})();

this.SelectInput = (function() {
  function SelectInput(id, label, values, disabled) {
    var i, value;
    this.id = id;
    this.label = label;
    this.values = values;
    this.disabled = disabled;
    this.html = "<div class=\"form-group\">\n    <label for=\"algorythm\"\n      class=\"control-label col-sm-6 col-xs-5\">" + this.label + ":</label>\n    <div class=\"col-sm-4 col-xs-7\">\n        <select class=\"form-control input-sm\" id=\"" + this.id + "\"\n            " + (this.disabled ? 'disabled' : '') + ">\n          " + ((function() {
      var j, len, ref, results;
      ref = this.values;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        value = ref[i];
        results.push('<option value="' + i + '">' + value + '</option>');
      }
      return results;
    }).call(this)) + "\n        </select>\n    </div>\n</div>";
  }

  SelectInput.prototype.set = function(value) {
    return $('#' + this.id).val(value);
  };

  SelectInput.prototype.get = function() {
    return parseInt($('#' + this.id).val());
  };

  SelectInput.prototype.setListener = function(callback) {
    return $('#' + this.id).change(callback);
  };

  SelectInput.prototype.disable = function() {
    return $('#' + this.id).removeAttr('disabled', '');
  };

  SelectInput.prototype.enable = function() {
    return $('#' + this.id).attr('disabled', '');
  };

  return SelectInput;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIvZm9ybS1jb250cm9sbGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDTSxJQUFDLENBQUE7RUFDUSxzQkFBQyxFQUFELEVBQU0sS0FBTixFQUFjLEdBQWQsRUFBb0IsR0FBcEIsRUFBMEIsSUFBMUIsRUFBaUMsUUFBakM7SUFBQyxJQUFDLENBQUEsS0FBRDtJQUFLLElBQUMsQ0FBQSxRQUFEO0lBQVEsSUFBQyxDQUFBLE1BQUQ7SUFBTSxJQUFDLENBQUEsTUFBRDtJQUFNLElBQUMsQ0FBQSxPQUFEO0lBQU8sSUFBQyxDQUFBLFdBQUQ7SUFDNUMsSUFBQyxDQUFBLElBQUQsR0FBUSw2Q0FBQSxHQUVVLElBQUMsQ0FBQSxFQUZYLEdBRWMsc0RBRmQsR0FHMEMsSUFBQyxDQUFBLEtBSDNDLEdBR2lELHNIQUhqRCxHQU1HLENBQUssZ0JBQUgsR0FBYyxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQVgsR0FBaUIsR0FBL0IsR0FBd0MsRUFBMUMsQ0FOSCxHQU1nRCxZQU5oRCxHQU9HLENBQUssZ0JBQUgsR0FBYyxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQVgsR0FBaUIsR0FBL0IsR0FBd0MsRUFBMUMsQ0FQSCxHQU9nRCxZQVBoRCxHQVFHLENBQUssaUJBQUgsR0FBZSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQVosR0FBbUIsR0FBbEMsR0FBMkMsRUFBN0MsQ0FSSCxHQVFtRCxpQkFSbkQsR0FTUSxJQUFDLENBQUEsRUFUVCxHQVNZLEtBVFosR0FTZSxDQUFLLElBQUMsQ0FBQSxRQUFKLEdBQWtCLFVBQWxCLEdBQWtDLEVBQXBDLENBVGYsR0FTc0Q7RUFWbkQ7O3lCQWNiLEdBQUEsR0FBSyxTQUFDLEtBQUQ7V0FBVyxDQUFBLENBQUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxFQUFULENBQVksQ0FBQyxHQUFiLENBQWlCLEtBQWpCO0VBQVg7O3lCQUNMLEdBQUEsR0FBSyxTQUFBO1dBQU0sUUFBQSxDQUFTLENBQUEsQ0FBRSxHQUFBLEdB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QUEsR0FBTSxJQUFDLENBQUEsRUFBVCxDQUFZLENBQUMsR0FBYixDQUFBLENBQVQ7RUFBTjs7d0JBQ0wsV0FBQSxHQUFhLFNBQUMsUUFBRDtXQUFjLENBQUEsQ0FBRSxHQUFBLEdBQU0sSUFBQyxDQUFBLEVBQVQsQ0FBWSxDQUFDLE1BQWIsQ0FBb0IsUUFBcEI7RUFBZDs7d0JBQ2IsT0FBQSxHQUFTLFNBQUE7V0FBTSxDQUFBLENBQUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxFQUFULENBQVksQ0FBQyxVQUFiLENBQXdCLFVBQXhCLEVBQW9DLEVBQXBDO0VBQU47O3dCQUNULE1BQUEsR0FBUSxTQUFBO1dBQU0sQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFDLENBQUEsRUFBVCxDQUFZLENBQUMsSUFBYixDQUFrQixVQUFsQixFQUE4QixFQUE5QjtFQUFOIiwiZmlsZSI6ImNvbnRyb2xsZXIvZm9ybS1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmNsYXNzIEBOdW1lcmljSW5wdXRcclxuICBjb25zdHJ1Y3RvcjogKEBpZCwgQGxhYmVsLCBAbWluLCBAbWF4LCBAc3RlcCwgQGRpc2FibGVkKSAtPlxyXG4gICAgQGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICA8bGFiZWwgZm9yPVwiI3tAaWR9XCJcclxuICAgICAgICAgICAgY2xhc3M9XCJjb250cm9sLWxhYmVsIGNvbC1zbS02IGNvbC14cy01XCI+I3tAbGFiZWx9OjwvbGFiZWw+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zbS00IGNvbC14cy03XCI+XHJcbiAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXNtXCJcclxuICAgICAgICAgICAgICAjeyBpZiBAbWluPyB0aGVuICdtaW49XCInICsgQG1pbiArICdcIicgZWxzZSAnJ31cclxuICAgICAgICAgICAgICAjeyBpZiBAbWF4PyB0aGVuICdtYXg9XCInICsgQG1heCArICdcIicgZWxzZSAnJ31cclxuICAgICAgICAgICAgICAjeyBpZiBAc3RlcD8gdGhlbiAnc3RlcD1cIicgKyBAc3RlcCArICdcIicgZWxzZSAnJ31cclxuICAgICAgICAgICAgICBpZD1cIiN7QGlkfVwiICN7IGlmIEBkaXNhYmxlZCB0aGVuICdkaXNhYmxlZCcgZWxzZSAnJ30gPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIFwiXCJcIlxyXG4gIHNldDogKHZhbHVlKSAtPiAkKCcjJyArIEBpZCkudmFsKHZhbHVlKVxyXG4gIGdldDogKCkgLT4gcGFyc2VJbnQgJCgnIycgKyBAaWQpLnZhbCgpXHJcbiAgc2V0TGlzdGVuZXI6IChjYWxsYmFjaykgLT4gJCgnIycgKyBAaWQpLmNoYW5nZSBjYWxsYmFja1xyXG4gIGRpc2FibGU6ICgpIC0+ICQoJyMnICsgQGlkKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcsICcnKVxyXG4gIGVuYWJsZTogKCkgLT4gJCgnIycgKyBAaWQpLmF0dHIoJ2Rpc2FibGVkJywgJycpXHJcblxyXG5jbGFzcyBAVG9nZ2xlSW5wdXRcclxuICBjb25zdHJ1Y3RvcjogKEBpZCwgQGxhYmVsLCBAZGlzYWJsZWQpIC0+XHJcbiAgICBAaHRtbCA9IFwiXCJcIlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgPGxhYmVsIGZvcj1cIiN7QGlkfVwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwiY29udHJvbC1sYWJlbCBjb2wtc20tNiBjb2wteHMtNVwiPiN7QGxhYmVsfTo8L2xhYmVsPlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbC1zbS00IGNvbC14cy03XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGVja2JveFwiPlxyXG4gICAgICAgICAgICAgIDxsYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiI3tAaWR9XCJcclxuICAgICAgICAgICAgICAgICAgICAjeyBpZiBAZGlzYWJsZWQgdGhlbiAnZGlzYWJsZWQnIGVsc2UgJyd9PiBFbmFibGVkXHJcbiAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICBzZXQ6ICh2YWx1ZSkgLT4gJCgnIycgKyBAaWQpLnByb3AoXCJjaGVja2VkXCIsIGlmIHZhbHVlIHRoZW4gXCJvblwiIGVsc2UgZmFsc2UpXHJcbiAgZ2V0OiAodmFsdWUpIC0+ICQoJyMnICsgQGlkKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gIHNldExpc3RlbmVyOiAoY2FsbGJhY2spIC0+ICQoJyMnICsgQGlkKS5jaGFuZ2UgY2FsbGJhY2tcclxuICBkaXNhYmxlOiAoKSAtPiAkKCcjJyArIEBpZCkucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnJylcclxuICBlbmFibGU6ICgpIC0+ICQoJyMnICsgQGlkKS5hdHRyKCdkaXNhYmxlZCcsICcnKVxyXG5cclxuY2xhc3MgQFNlbGVjdElucHV0XHJcbiAgY29uc3RydWN0b3I6IChAaWQsIEBsYWJlbCwgQHZhbHVlcywgQGRpc2FibGVkKSAtPlxyXG4gICAgQGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbGdvcnl0aG1cIlxyXG4gICAgICAgICAgICBjbGFzcz1cImNvbnRyb2wtbGFiZWwgY29sLXNtLTYgY29sLXhzLTVcIj4je0BsYWJlbH06PC9sYWJlbD5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tNCBjb2wteHMtN1wiPlxyXG4gICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiBpZD1cIiN7QGlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICN7IGlmIEBkaXNhYmxlZCB0aGVuICdkaXNhYmxlZCcgZWxzZSAnJ30+XHJcbiAgICAgICAgICAgICAgICAjeygnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICsgJzwvb3B0aW9uPicpIGZvciB2YWx1ZSwgaSBpbiBAdmFsdWVzfVxyXG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgXCJcIlwiXHJcbiAgc2V0OiAodmFsdWUpIC0+ICQoJyMnICsgQGlkKS52YWwodmFsdWUpXHJcbiAgZ2V0OiAoKSAtPiBwYXJzZUludCAkKCcjJyArIEBpZCkudmFsKClcclxuICBzZXRMaXN0ZW5lcjogKGNhbGxiYWNrKSAtPiAkKCcjJyArIEBpZCkuY2hhbmdlIGNhbGxiYWNrXHJcbiAgZGlzYWJsZTogKCkgLT4gJCgnIycgKyBAaWQpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgJycpXHJcbiAgZW5hYmxlOiAoKSAtPiAkKCcjJyArIEBpZCkuYXR0cignZGlzYWJsZWQnLCAnJylcclxuIl19