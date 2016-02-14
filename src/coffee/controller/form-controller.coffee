
class @NumericInput
  constructor: (@id, @label, @min, @max, @step, @disabled) ->
    @html = """
      <div class="form-group">
        <label for="#{@id}"
            class="control-label col-sm-6 col-xs-5">#{@label}:</label>
        <div class="col-sm-4 col-xs-7">
          <input type="number" class="form-control input-sm"
              #{ if @min? then 'min="' + @min + '"' else ''}
              #{ if @max? then 'max="' + @max + '"' else ''}
              #{ if @step? then 'step="' + @step + '"' else ''}
              id="#{@id}" #{ if @disabled then 'disabled' else ''} >
        </div>
      </div>
    """
  set: (value) -> $('#' + @id).val(value)
  get: () -> parseInt $('#' + @id).val()
  setListener: (callback) -> $('#' + @id).change callback
  disable: () -> $('#' + @id).removeAttr('disabled', '')
  enable: () -> $('#' + @id).attr('disabled', '')

class @ToggleInput
  constructor: (@id, @label, @disabled) ->
    @html = """
      <div class="form-group">
          <label for="#{@id}"
            class="control-label col-sm-6 col-xs-5">#{@label}:</label>
          <div class="col-sm-4 col-xs-7">
            <div class="checkbox">
              <label>
                  <input type="checkbox" id="#{@id}"
                    #{ if @disabled then 'disabled' else ''}> Enabled
              </label>
            </div>
          </div>
      </div>
    """
  set: (value) -> $('#' + @id).prop("checked", if value then "on" else false)
  get: () -> $('#' + @id).prop("checked")
  setListener: (callback) -> $('#' + @id).change callback
  disable: () -> $('#' + @id).removeAttr('disabled', '')
  enable: () -> $('#' + @id).attr('disabled', '')

class @SelectInput
  constructor: (@id, @label, @values, @disabled) ->
    @html = """
      <div class="form-group">
          <label for="algorythm"
            class="control-label col-sm-6 col-xs-5">#{@label}:</label>
          <div class="col-sm-4 col-xs-7">
              <select class="form-control input-sm" id="#{@id}"
                  #{ if @disabled then 'disabled' else ''}>
                #{('<option value="' + i + '">' +
                    value + '</option>') for value, i in @values}
              </select>
          </div>
      </div>
    """
  set: (value) -> $('#' + @id).val(value)
  get: () -> parseInt $('#' + @id).val()
  setListener: (callback) -> $('#' + @id).change callback
  disable: () -> $('#' + @id).removeAttr('disabled', '')
  enable: () -> $('#' + @id).attr('disabled', '')

class @ToggleableNumericInput
  constructor: (@id, @label, @min, @max, @step, @disabled) ->
    @html = """
      <div class="form-group">
        <label for="#{@id}"
            class="control-label col-sm-6 col-xs-5">#{@label}:</label>
        <div class="col-sm-3 col-xs-6">
          <input type="number" class="form-control input-sm"
              #{ if @min? then 'min="' + @min + '"' else ''}
              #{ if @max? then 'max="' + @max + '"' else ''}
              #{ if @step? then 'step="' + @step + '"' else ''}
              id="#{@id}" #{ if @disabled then 'disabled' else ''} >
        </div>
        <div class="col-xs-1 col-sm-1 input-sm">
          <input id="#{@id}-enable" type="checkbox"
              #{ 'checked="on"' unless @disabled}>
        </div>
      </div>
    """
  set: (value) -> $('#' + @id).val(value)
  getValue: () -> parseFloat $('#' + @id).val()
  getToggleState: () -> $('#' + @id + '-enable').prop("checked")
  toggle: (value) ->
    if value then $('#' + @id).removeAttr('disabled', '')
    else $('#' + @id).attr('disabled', '')
    $('#' + @id + '-enable')
      .prop("checked", if value then "on" else false)
  setValueListener: (callback) -> $('#' + @id).change callback
  setToggleListener: (callback) -> $('#' + @id + '-enable').change callback
  disable: () ->
    $('#' + @id).removeAttr('disabled', '')
    $('#' + @id + '-enable').removeAttr('disabled', '')
  enable: () ->
    $('#' + @id).attr('disabled', '')
    $('#' + @id + '-enable').removeAttr('disabled', '')
