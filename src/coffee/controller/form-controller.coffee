
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
  get: (value) -> $('#' + @id).prop("checked")
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
