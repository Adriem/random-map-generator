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

  ToggleInput.prototype.get = function() {
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

this.ToggleableNumericInput = (function() {
  function ToggleableNumericInput(id, label, min, max, step, disabled) {
    this.id = id;
    this.label = label;
    this.min = min;
    this.max = max;
    this.step = step;
    this.disabled = disabled;
    this.html = "<div class=\"form-group\">\n  <label for=\"" + this.id + "\"\n      class=\"control-label col-sm-6 col-xs-5\">" + this.label + ":</label>\n  <div class=\"col-sm-3 col-xs-6\">\n    <input type=\"number\" class=\"form-control input-sm\"\n        " + (this.min != null ? 'min="' + this.min + '"' : '') + "\n        " + (this.max != null ? 'max="' + this.max + '"' : '') + "\n        " + (this.step != null ? 'step="' + this.step + '"' : '') + "\n        id=\"" + this.id + "\" " + (this.disabled ? 'disabled' : '') + " >\n  </div>\n  <div class=\"col-xs-1 col-sm-1 input-sm\">\n    <input id=\"" + this.id + "-enable\" type=\"checkbox\"\n        " + (!this.disabled ? 'checked="on"' : void 0) + ">\n  </div>\n</div>";
  }

  ToggleableNumericInput.prototype.set = function(value) {
    return $('#' + this.id).val(value);
  };

  ToggleableNumericInput.prototype.getValue = function() {
    return parseFloat($('#' + this.id).val());
  };

  ToggleableNumericInput.prototype.getToggleState = function() {
    return $('#' + this.id + '-enable').prop("checked");
  };

  ToggleableNumericInput.prototype.toggle = function(value) {
    if (value) {
      $('#' + this.id).removeAttr('disabled', '');
    } else {
      $('#' + this.id).attr('disabled', '');
    }
    return $('#' + this.id + '-enable').prop("checked", value ? "on" : false);
  };

  ToggleableNumericInput.prototype.setValueListener = function(callback) {
    return $('#' + this.id).change(callback);
  };

  ToggleableNumericInput.prototype.setToggleListener = function(callback) {
    return $('#' + this.id + '-enable').change(callback);
  };

  ToggleableNumericInput.prototype.disable = function() {
    $('#' + this.id).removeAttr('disabled', '');
    return $('#' + this.id + '-enable').removeAttr('disabled', '');
  };

  ToggleableNumericInput.prototype.enable = function() {
    $('#' + this.id).attr('disabled', '');
    return $('#' + this.id + '-enable').removeAttr('disabled', '');
  };

  return ToggleableNumericInput;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIvZm9ybS1jb250cm9sbGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDTSxJQUFDLENBQUE7RUFDUSxzQkFBQyxFQUFELEVBQU0sS0FBTixFQUFjLEdBQWQsRUFBb0IsR0FBcEIsRUFBMEIsSUFBMUIsRUFBaUMsUUFBakM7SUFBQyxJQUFDLENBQUEsS0FBRDtJQUFLLElBQUMsQ0FBQSxRQUFEO0lBQVEsSUFBQyxDQUFBLE1BQUQ7SUFBTSxJQUFDLENBQUEsTUFBRDtJQUFNLElBQUMsQ0FBQSxPQUFEO0lBQU8sSUFBQyxDQUFBLFdBQUQ7SUFDNUMsSUFBQyxDQUFBLElBQUQsR0FBUSw2Q0FBQSxHQUVVLElBQUMsQ0FBQSxFQUZYLEdBRWMsc0RBRmQsR0FHMEMsSUFBQyxDQUFBLEtBSDNDLEdBR2lELHNIQUhqRCxHQU1HLENBQUssZ0JBQUgsR0FBYyxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQVgsR0FBaUIsR0FBL0IsR0FBd0MsRUFBMUMsQ0FOSCxHQU1nRCxZQU5oRCxHQU9HLENBQUssZ0JBQUgsR0FBYyxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQVgsR0FBaUIsR0FBL0IsR0FBd0MsRUFBMUMsQ0FQSCxHQU9nRCxZQVBoRCxHQVFHLENBQUssaUJBQUgsR0FBZSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQVosR0FBbUIsR0FBbEMsR0FBMkMsRUFBN0MsQ0FSSCxHQVFtRCxpQkFSbkQsR0FTUSxJQUFDLENBQUEsRUFUVCxHQVNZLEtBVFosR0FTZSxDQUFLLElBQUMsQ0FBQSxRQUFKLEdBQWtCLFVBQWxCLEdBQWtDLEVBQXBDLENBVGYsR0FTc0Q7RUFWbkQ7O3lCQWNiLEdBQUEsR0FBSyxTQUFDLEtBQUQ7V0FBVyxDQUFBLENBQUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxFQUFULENBQVksQ0FBQyxHQUFiLENBQWlCLEtBQWpCO0VBQVg7O3lCQUNMLEdBQUEsR0FBSyxTQUFBO1dBQU0sUUFBQSxDQUFTLENBQUEsQ0FBRSxHQUFBLEdB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O1dBQWMsQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFDLENBQUEsRUFBVCxDQUFZLENBQUMsTUFBYixDQUFvQixRQUFwQjtFQUFkOzttQ0FDbEIsaUJBQUEsR0FBbUIsU0FBQyxRQUFEO1dBQWMsQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFDLENBQUEsRUFBUCxHQUFZLFNBQWQsQ0FBd0IsQ0FBQyxNQUF6QixDQUFnQyxRQUFoQztFQUFkOzttQ0FDbkIsT0FBQSxHQUFTLFNBQUE7SUFDUCxDQUFBLENBQUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxFQUFULENBQVksQ0FBQyxVQUFiLENBQXdCLFVBQXhCLEVBQW9DLEVBQXBDO1dBQ0EsQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFDLENBQUEsRUFBUCxHQUFZLFNBQWQsQ0FBd0IsQ0FBQyxVQUF6QixDQUFvQyxVQUFwQyxFQUFnRCxFQUFoRDtFQUZPOzttQ0FHVCxNQUFBLEdBQVEsU0FBQTtJQUNOLENBQUEsQ0FBRSxHQUFBLEdBQU0sSUFBQyxDQUFBLEVBQVQsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsVUFBbEIsRUFBOEIsRUFBOUI7V0FDQSxDQUFBLENBQUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxFQUFQLEdBQVksU0FBZCxDQUF3QixDQUFDLFVBQXpCLENBQW9DLFVBQXBDLEVBQWdELEVBQWhEO0VBRk0iLCJmaWxlIjoiY29udHJvbGxlci9mb3JtLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY2xhc3MgQE51bWVyaWNJbnB1dFxyXG4gIGNvbnN0cnVjdG9yOiAoQGlkLCBAbGFiZWwsIEBtaW4sIEBtYXgsIEBzdGVwLCBAZGlzYWJsZWQpIC0+XHJcbiAgICBAaHRtbCA9IFwiXCJcIlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgIDxsYWJlbCBmb3I9XCIje0BpZH1cIlxyXG4gICAgICAgICAgICBjbGFzcz1cImNvbnRyb2wtbGFiZWwgY29sLXNtLTYgY29sLXhzLTVcIj4je0BsYWJlbH06PC9sYWJlbD5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTQgY29sLXhzLTdcIj5cclxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIlxyXG4gICAgICAgICAgICAgICN7IGlmIEBtaW4/IHRoZW4gJ21pbj1cIicgKyBAbWluICsgJ1wiJyBlbHNlICcnfVxyXG4gICAgICAgICAgICAgICN7IGlmIEBtYXg/IHRoZW4gJ21heD1cIicgKyBAbWF4ICsgJ1wiJyBlbHNlICcnfVxyXG4gICAgICAgICAgICAgICN7IGlmIEBzdGVwPyB0aGVuICdzdGVwPVwiJyArIEBzdGVwICsgJ1wiJyBlbHNlICcnfVxyXG4gICAgICAgICAgICAgIGlkPVwiI3tAaWR9XCIgI3sgaWYgQGRpc2FibGVkIHRoZW4gJ2Rpc2FibGVkJyBlbHNlICcnfSA+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgXCJcIlwiXHJcbiAgc2V0OiAodmFsdWUpIC0+ICQoJyMnICsgQGlkKS52YWwodmFsdWUpXHJcbiAgZ2V0OiAoKSAtPiBwYXJzZUludCAkKCcjJyArIEBpZCkudmFsKClcclxuICBzZXRMaXN0ZW5lcjogKGNhbGxiYWNrKSAtPiAkKCcjJyArIEBpZCkuY2hhbmdlIGNhbGxiYWNrXHJcbiAgZGlzYWJsZTogKCkgLT4gJCgnIycgKyBAaWQpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgJycpXHJcbiAgZW5hYmxlOiAoKSAtPiAkKCcjJyArIEBpZCkuYXR0cignZGlzYWJsZWQnLCAnJylcclxuXHJcbmNsYXNzIEBUb2dnbGVJbnB1dFxyXG4gIGNvbnN0cnVjdG9yOiAoQGlkLCBAbGFiZWwsIEBkaXNhYmxlZCkgLT5cclxuICAgIEBodG1sID0gXCJcIlwiXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICA8bGFiZWwgZm9yPVwiI3tAaWR9XCJcclxuICAgICAgICAgICAgY2xhc3M9XCJjb250cm9sLWxhYmVsIGNvbC1zbS02IGNvbC14cy01XCI+I3tAbGFiZWx9OjwvbGFiZWw+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXNtLTQgY29sLXhzLTdcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoZWNrYm94XCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCIje0BpZH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICN7IGlmIEBkaXNhYmxlZCB0aGVuICdkaXNhYmxlZCcgZWxzZSAnJ30+IEVuYWJsZWRcclxuICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIFwiXCJcIlxyXG4gIHNldDogKHZhbHVlKSAtPiAkKCcjJyArIEBpZCkucHJvcChcImNoZWNrZWRcIiwgaWYgdmFsdWUgdGhlbiBcIm9uXCIgZWxzZSBmYWxzZSlcclxuICBnZXQ6ICgpIC0+ICQoJyMnICsgQGlkKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gIHNldExpc3RlbmVyOiAoY2FsbGJhY2spIC0+ICQoJyMnICsgQGlkKS5jaGFuZ2UgY2FsbGJhY2tcclxuICBkaXNhYmxlOiAoKSAtPiAkKCcjJyArIEBpZCkucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnJylcclxuICBlbmFibGU6ICgpIC0+ICQoJyMnICsgQGlkKS5hdHRyKCdkaXNhYmxlZCcsICcnKVxyXG5cclxuY2xhc3MgQFNlbGVjdElucHV0XHJcbiAgY29uc3RydWN0b3I6IChAaWQsIEBsYWJlbCwgQHZhbHVlcywgQGRpc2FibGVkKSAtPlxyXG4gICAgQGh0bWwgPSBcIlwiXCJcclxuICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbGdvcnl0aG1cIlxyXG4gICAgICAgICAgICBjbGFzcz1cImNvbnRyb2wtbGFiZWwgY29sLXNtLTYgY29sLXhzLTVcIj4je0BsYWJlbH06PC9sYWJlbD5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tNCBjb2wteHMtN1wiPlxyXG4gICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiBpZD1cIiN7QGlkfVwiXHJcbiAgICAgICAgICAgICAgICAgICN7IGlmIEBkaXNhYmxlZCB0aGVuICdkaXNhYmxlZCcgZWxzZSAnJ30+XHJcbiAgICAgICAgICAgICAgICAjeygnPG9wdGlvbiB2YWx1ZT1cIicgKyBpICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICsgJzwvb3B0aW9uPicpIGZvciB2YWx1ZSwgaSBpbiBAdmFsdWVzfVxyXG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgXCJcIlwiXHJcbiAgc2V0OiAodmFsdWUpIC0+ICQoJyMnICsgQGlkKS52YWwodmFsdWUpXHJcbiAgZ2V0OiAoKSAtPiBwYXJzZUludCAkKCcjJyArIEBpZCkudmFsKClcclxuICBzZXRMaXN0ZW5lcjogKGNhbGxiYWNrKSAtPiAkKCcjJyArIEBpZCkuY2hhbmdlIGNhbGxiYWNrXHJcbiAgZGlzYWJsZTogKCkgLT4gJCgnIycgKyBAaWQpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgJycpXHJcbiAgZW5hYmxlOiAoKSAtPiAkKCcjJyArIEBpZCkuYXR0cignZGlzYWJsZWQnLCAnJylcclxuXHJcbmNsYXNzIEBUb2dnbGVhYmxlTnVtZXJpY0lucHV0XHJcbiAgY29uc3RydWN0b3I6IChAaWQsIEBsYWJlbCwgQG1pbiwgQG1heCwgQHN0ZXAsIEBkaXNhYmxlZCkgLT5cclxuICAgIEBodG1sID0gXCJcIlwiXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgPGxhYmVsIGZvcj1cIiN7QGlkfVwiXHJcbiAgICAgICAgICAgIGNsYXNzPVwiY29udHJvbC1sYWJlbCBjb2wtc20tNiBjb2wteHMtNVwiPiN7QGxhYmVsfTo8L2xhYmVsPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wtc20tMyBjb2wteHMtNlwiPlxyXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC1zbVwiXHJcbiAgICAgICAgICAgICAgI3sgaWYgQG1pbj8gdGhlbiAnbWluPVwiJyArIEBtaW4gKyAnXCInIGVsc2UgJyd9XHJcbiAgICAgICAgICAgICAgI3sgaWYgQG1heD8gdGhlbiAnbWF4PVwiJyArIEBtYXggKyAnXCInIGVsc2UgJyd9XHJcbiAgICAgICAgICAgICAgI3sgaWYgQHN0ZXA/IHRoZW4gJ3N0ZXA9XCInICsgQHN0ZXAgKyAnXCInIGVsc2UgJyd9XHJcbiAgICAgICAgICAgICAgaWQ9XCIje0BpZH1cIiAjeyBpZiBAZGlzYWJsZWQgdGhlbiAnZGlzYWJsZWQnIGVsc2UgJyd9ID5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sLXhzLTEgY29sLXNtLTEgaW5wdXQtc21cIj5cclxuICAgICAgICAgIDxpbnB1dCBpZD1cIiN7QGlkfS1lbmFibGVcIiB0eXBlPVwiY2hlY2tib3hcIlxyXG4gICAgICAgICAgICAgICN7ICdjaGVja2VkPVwib25cIicgdW5sZXNzIEBkaXNhYmxlZH0+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgXCJcIlwiXHJcbiAgc2V0OiAodmFsdWUpIC0+ICQoJyMnICsgQGlkKS52YWwodmFsdWUpXHJcbiAgZ2V0VmFsdWU6ICgpIC0+IHBhcnNlRmxvYXQgJCgnIycgKyBAaWQpLnZhbCgpXHJcbiAgZ2V0VG9nZ2xlU3RhdGU6ICgpIC0+ICQoJyMnICsgQGlkICsgJy1lbmFibGUnKS5wcm9wKFwiY2hlY2tlZFwiKVxyXG4gIHRvZ2dsZTogKHZhbHVlKSAtPlxyXG4gICAgaWYgdmFsdWUgdGhlbiAkKCcjJyArIEBpZCkucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnJylcclxuICAgIGVsc2UgJCgnIycgKyBAaWQpLmF0dHIoJ2Rpc2FibGVkJywgJycpXHJcbiAgICAkKCcjJyArIEBpZCArICctZW5hYmxlJylcclxuICAgICAgLnByb3AoXCJjaGVja2VkXCIsIGlmIHZhbHVlIHRoZW4gXCJvblwiIGVsc2UgZmFsc2UpXHJcbiAgc2V0VmFsdWVMaXN0ZW5lcjogKGNhbGxiYWNrKSAtPiAkKCcjJyArIEBpZCkuY2hhbmdlIGNhbGxiYWNrXHJcbiAgc2V0VG9nZ2xlTGlzdGVuZXI6IChjYWxsYmFjaykgLT4gJCgnIycgKyBAaWQgKyAnLWVuYWJsZScpLmNoYW5nZSBjYWxsYmFja1xyXG4gIGRpc2FibGU6ICgpIC0+XHJcbiAgICAkKCcjJyArIEBpZCkucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnJylcclxuICAgICQoJyMnICsgQGlkICsgJy1lbmFibGUnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcsICcnKVxyXG4gIGVuYWJsZTogKCkgLT5cclxuICAgICQoJyMnICsgQGlkKS5hdHRyKCdkaXNhYmxlZCcsICcnKVxyXG4gICAgJCgnIycgKyBAaWQgKyAnLWVuYWJsZScpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgJycpXHJcbiJdfQ==