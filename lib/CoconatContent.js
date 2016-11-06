/* 
 * 
 * Copyright 2015-2016 Martin Goellnitz
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 */

function CoconatContent(contentId, type, props) {

  var id = contentId;

  var documentType = type;

  var properties = props;

  this.getId = function() {
    return id;
  };


  this.getDocumentType = function() {
    return documentType;
  };


  this.get= function(name) {
    return properties[name];
  };


  this.set = function(name, value) {
    return properties[name] = value;
  };

}

