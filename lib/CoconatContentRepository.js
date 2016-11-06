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

/**
 * Mostly still pseudocode derived from the PHP version.
 *
 * @returns {CoconatContentRepository}
 */
function CoconatContentRepository() {

  this.getType = function(id) {
    var type = null;
    var query = "SELECT * FROM Resources WHERE id_ = '$id'";
    try {
      var statement = this.dbConnection.query(query);
      while (row = statement.fetch()) {
        type = row['documentType_'];
      }

      if (type == null) {
        type = ""; // Folder indication
      }
    } catch (pdoException) {
    }
    return type;
  };

  this.getProperties = function(type, id) {
    properties = array();
    if (type == null || strlen(type) == 0) {
      return properties;
    }
    var query = "SELECT * FROM $type WHERE id_ = $id ORDER BY version_ DESC";
    try {
      var statement = this.dbConnection.query(query);
      var row = statement.fetch();
      if (row) {
        var id = row['id_'];
        var version = row['version_'];

        for (keyvalue in row) {
          // TODO: only string keys to be used
          properties[key] = value;
        }

        // select link lists
        $linkLists = array();
        try {
          var linkquery = "SELECT * FROM LinkLists WHERE sourcedocument = $id AND sourceversion = $version ORDER BY propertyname ASC, linkindex ASC";
          var linkstatement = this.dbConnection.query(linkquery);
          var ids = null;
          while (row = linkstatement.fetch()) {
            var propertyName = row['propertyName'];
            var targetid = row['targetDocument'];
            var linkIndex = row['linkIndex'];
            if (ids == null) {
              ids = array();
              linkLists[propertyName] = ids;
            }
            ids[linkIndex] = targetid;
          }
        } catch (pdoException) {
        }
        // Pseudocode!
        for (key_idlist in linkLists) {
          var list = array();
          for (linkid in idlist) {
            // TODO: lazy loading
            var t = this.getType(linkid);
            var p = this.getProperties(t, linkid);
            // var list[] = new CoconatContent(t, linkid, p);
          }
          properties[key] = list;
        }

        // select blobs
        var blobIds = array();
        var propertyNames = array();
        try {
          var blobidquery = "SELECT * FROM Blobs WHERE documentid = $id AND documentversion = $version ORDER BY propertyname ASC";
          var blobstatement = this.dbConnection.query(blobidquery);
          while (row = blobstatement.fetch()) {
            var propertyName = row['propertyName'];
            var blobId = row['target'];
            // var blobIds[] = blobId;
            // var propertyNames[] = propertyName;
          }
        } catch (pdoException) {
        }

        for (var i = 0; i < count(blobIds); i++) {
          var blobId = blobIds[i];
          var propertyName = propertyNames[i];
          try {
            var blobdataquery = "SELECT * FROM BlobData WHERE id = $blobId";
            var statement = this.dbConnection.query(blobdataquery);
            while (row = statement.fetch()) {
              var mimeType = row['mimeType'];
              var data = row['data'];
              var len = row['len'];
              var blob = new CoconatBlob(id, propertyName, mimeType, len, data);
              properties[propertyName] = blob;
            }
          } catch (pdoException ) {
          }
        }

        // select xml
        var xmlquery = "SELECT * FROM Texts WHERE documentid = $id AND documentversion = $version ORDER BY propertyname ASC";
        var xmlstatement = this.dbConnection.query(xmlquery);
        while (xmlrow = xmlstatement.fetch()) {
          var propertyName = xmlrow['propertyName'];
          var target = xmlrow['target'];

          var text = "";
          var textquery = "SELECT * FROM SgmlText WHERE id = $target";
          var textstatement = this.dbConnection.query(textquery);
          while (textrow = textstatement.fetch()) {
            var xmlText = textrow['text'];
            text = text+xmlText;
          }
          var data = "";
          var dataquery = "SELECT * FROM SgmlData WHERE id = $target";
          var datastatement = this.dbConnection.query(dataquery);
          while (datarow = datastatement.fetch()) {
            var xmlData = datarow['data'];
            data = data+xmlData;
          }

          properties[propertyName] = CoconatTextConverter.convert(text, data);
        }
      }
    } catch (pdoException) {
    }
    return properties;
  };

  this.getChildIdFromParentId = function(name, parentId) {
    var id = null;
    try {
      var query = "SELECT * FROM Resources WHERE folderid_ = $parentId AND name_ = '$name'";
      var statement = this.dbConnection.query(query);
      while (row = statement.fetch()) {
        var id = row['id_'];
      }
    } catch (pdoException) {
    }
    return id;
  }

  this.getChildId = function(path) {
    var arcs = split("/", path);
    var currentFolder = "1"; // root
    for (folder in arcs) {
      if (strlen(folder) > 0) {
        currentFolder = getChildIdFromParentId(folder, currentFolder);
      }
    }
    return currentFolder;
  };

  this.getContent = function(id) {
    var result;

    var type = getType(id);
    if (type !== null) {
      var properties = getProperties(type, id);
      // properties . putAll(additionalProperties);
      result = new CoconatContent(type, id, properties);
    } // if

    return result;
  };

  this.getChild = function(path) {
    return getContent(getChildId(path));
  };

}
